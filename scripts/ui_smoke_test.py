import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"

REQUIRED_FILES = [
    ROOT / "css" / "main.css",
    ROOT / "js" / "main.js",
    ROOT / "notificationservice" / "notification_alert.css",
    ROOT / "notificationservice" / "notifications_alert.js",
    INDEX,
]

REQUIRED_IDS = [
    "cesiumContainer",
    "menu",
    "rightPanel",
    "notificationArea",
    "trafficAlert",
    "weatherAlert",
    "eventAlert",
    "minimap",
]

REQUIRED_CLASSES = [
    "chat-container",
    "alert-box",
]


def fail(message):
    print(f"FAIL: {message}")
    sys.exit(1)


def main():
    missing = [path for path in REQUIRED_FILES if not path.exists()]
    if missing:
        for path in missing:
            print(f"Missing file: {path.relative_to(ROOT)}")
        fail("Required files are missing.")

    html = INDEX.read_text(encoding="utf-8", errors="ignore")

    for element_id in REQUIRED_IDS:
        pattern = rf'id=["\"]{re.escape(element_id)}["\"]'
        if not re.search(pattern, html):
            fail(f"Missing required id: {element_id}")

    for class_name in REQUIRED_CLASSES:
        pattern = rf'class=["\"][^"\"]*\b{re.escape(class_name)}\b[^"\"]*["\"]'
        if not re.search(pattern, html):
            fail(f"Missing required class: {class_name}")

    print("OK: UI smoke test passed.")


if __name__ == "__main__":
    main()
