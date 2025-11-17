import json
import os
import time
import requests
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis-cart")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

ABANDON_SECONDS = int(os.getenv("ABANDON_SECONDS", "3600"))  # 1 hour default
NOTIFY_TTL = int(os.getenv("NOTIFY_TTL", "86400"))           # 24h do-not-repeat

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
DEFAULT_EMAIL = os.getenv("DEFAULT_EMAIL")

assert N8N_WEBHOOK_URL, "N8N_WEBHOOK_URL is required"
assert DEFAULT_EMAIL, "DEFAULT_EMAIL is required (demo recipient)"

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, password=REDIS_PASSWORD, decode_responses=True)


def is_notified(key: str) -> bool:
    return r.exists(f"abandoned:sent:{key}") == 1


def mark_notified(key: str):
    r.setex(f"abandoned:sent:{key}", NOTIFY_TTL, "1")


def get_idle_time(key: str) -> int:
    # OBJECT idletime <key> returns seconds since last access
    try:
        idle = r.object("idletime", key)
        return int(idle) if idle is not None else -1
    except redis.RedisError:
        return -1


def detect_and_notify():
    matched = 0
    notified = 0
    cursor = 0
    # No prefix on cart keys in microservices-demo; scan all keys in this DB
    while True:
        cursor, keys = r.scan(cursor=cursor, count=500)
        for key in keys:
            # Skip our own marker keys
            if key.startswith("abandoned:sent:"):
                continue
            matched += 1
            idle = get_idle_time(key)
            if idle >= ABANDON_SECONDS and not is_notified(key):
                payload = {
                    "cartKey": key,
                    "idleTimeSec": idle,
                    "abandonThresholdSec": ABANDON_SECONDS,
                    "email": DEFAULT_EMAIL,
                    "discountCode": f"DISC-{int(time.time()) % 100000:05d}",
                    "message": "Abandoned cart detected from microservices-demo"
                }
                try:
                    resp = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=10)
                    if resp.status_code // 100 == 2:
                        mark_notified(key)
                        notified += 1
                        print(f"notified cart={key} idle={idle}s")
                    else:
                        print(f"webhook failed cart={key} status={resp.status_code} body={resp.text[:200]}")
                except Exception as e:
                    print(f"webhook error cart={key} err={e}")
        if cursor == 0:
            break
    print(json.dumps({"scanned": matched, "notified": notified}))


if __name__ == "__main__":
    detect_and_notify()
