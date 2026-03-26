"""
executor.py — Places market orders on Pacifica using Ed25519 signing.

Auth flow (per Pacifica docs):
1. Build payload with operation_type + data
2. Recursively sort JSON keys
3. Compact JSON → UTF-8 bytes → Ed25519 sign → Base58 encode
4. POST with auth headers merged into the request body

POST /orders/create
POST /orders/cancel
GET  /account (to check balance / positions)
"""

import os
import json
import time
import uuid
import base58
import requests
from solders.keypair import Keypair

BASE_URL = os.getenv("PACIFICA_BASE_URL", "https://test-api.pacifica.fi/api/v1")
PRIVATE_KEY = os.getenv("PACIFICA_PRIVATE_KEY", "")
MAX_POSITION_USDC = float(os.getenv("MAX_POSITION_USDC", "50"))
DRY_RUN = os.getenv("DRY_RUN", "true").lower() == "true"

_keypair = None


def _get_keypair() -> Keypair:
    global _keypair
    if _keypair is None:
        if not PRIVATE_KEY:
            raise ValueError("PACIFICA_PRIVATE_KEY is not set in environment.")
        _keypair = Keypair.from_bytes(base58.b58decode(PRIVATE_KEY))
    return _keypair


def _sort_json_keys(value):
    """Recursively sort dict keys alphabetically — required for deterministic signing."""
    if isinstance(value, dict):
        return {k: _sort_json_keys(v) for k in sorted(value.keys())}
    elif isinstance(value, list):
        return [_sort_json_keys(item) for item in value]
    return value


def _sign_payload(operation_type: str, data: dict) -> tuple[dict, str]:
    """
    Returns (request_header, signature_b58)
    """
    kp = _get_keypair()
    timestamp = int(time.time() * 1_000)
    expiry_window = 5_000

    data_to_sign = {
        "timestamp": timestamp,
        "expiry_window": expiry_window,
        "type": operation_type,
        "data": data,
    }

    sorted_msg = _sort_json_keys(data_to_sign)
    compact_json = json.dumps(sorted_msg, separators=(",", ":"))
    message_bytes = compact_json.encode("utf-8")

    signature = kp.sign_message(message_bytes)
    signature_b58 = base58.b58encode(bytes(signature)).decode("ascii")

    header = {
        "account": str(kp.pubkey()),
        "agent_wallet": None,
        "signature": signature_b58,
        "timestamp": timestamp,
        "expiry_window": expiry_window,
    }
    return header, signature_b58


def _post(path: str, operation_type: str, data: dict) -> dict:
    header, _ = _sign_payload(operation_type, data)
    body = {**header, **data}
    url = f"{BASE_URL}{path}"
    resp = requests.post(url, json=body, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_account_info() -> dict:
    """GET /account — returns balance, positions, unrealized PnL."""
    kp = _get_keypair()
    url = f"{BASE_URL}/account"
    resp = requests.get(url, params={"account": str(kp.pubkey())}, timeout=10)
    resp.raise_for_status()
    return resp.json()


def place_market_order(symbol: str, side: str, usdc_size: float) -> dict:
    """
    Place a market order.
    side: "bid" (long) or "ask" (short)
    usdc_size: notional value in USDC

    Returns the order response dict, or a mock dict in DRY_RUN mode.
    """
    capped_size = min(usdc_size, MAX_POSITION_USDC)
    client_order_id = str(uuid.uuid4())

    order_data = {
        "symbol": symbol,
        "side": side,
        "amount": str(round(capped_size, 4)),
        "tif": "IOC",           # Immediate-or-cancel = market-like behavior
        "reduce_only": False,
        "client_order_id": client_order_id,
    }

    if DRY_RUN:
        print(f"[DRY RUN] Would place {side.upper()} order: {order_data}")
        return {
            "dry_run": True,
            "client_order_id": client_order_id,
            "symbol": symbol,
            "side": side,
            "amount": capped_size,
            "status": "simulated",
        }

    return _post("/orders/create", "create_order", order_data)


def close_position(symbol: str, side: str, amount: str) -> dict:
    """
    Close an open position with a reduce-only order.
    side should be opposite of your open position.
    """
    order_data = {
        "symbol": symbol,
        "side": side,
        "amount": amount,
        "tif": "IOC",
        "reduce_only": True,
        "client_order_id": str(uuid.uuid4()),
    }

    if DRY_RUN:
        print(f"[DRY RUN] Would close position: {order_data}")
        return {"dry_run": True, "status": "simulated", **order_data}

    return _post("/orders/create", "create_order", order_data)