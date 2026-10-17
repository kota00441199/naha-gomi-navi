
import re
import json
import requests
from bs4 import BeautifulSoup

URL = "https://www.naha-sodaigomi.com/receipts/home/item"

response = requests.get(
    URL,
    timeout=30,
    headers={"User-Agent": "Mozilla/5.0"},
)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

items = []

for table in soup.find_all("table"):
    for row in table.find_all("tr"):
        cells = row.find_all(["td", "th"], recursive=False)

        # 分類・品目名・料金を含む行だけを対象にする
        if len(cells) < 4:
            continue

        values = [
            cell.get_text(" ", strip=True)
            for cell in cells
        ]

        kana, category, name, fee_text = values[:4]

        # 見出し行などを除外
        if category == "分類" or name == "品目名":
            continue

        # 料金を取得
        fee_match = re.search(r"([\d,]+)\s*円", fee_text)
        if not fee_match:
            continue

        fee = int(fee_match.group(1).replace(",", ""))

        # 処理券の枚数を取得
        row_text = row.get_text(" ", strip=True)
        ticket_match = re.search(
            r"処理券.*?x\s*(\d+)",
            row_text,
            re.IGNORECASE,
        )

        ticket_count = (
            int(ticket_match.group(1))
            if ticket_match
            else None
        )

        items.append({
            "id": len(items) + 1,
            "name": name,
            "category": category,
            "fee": fee,
            "ticketCount": ticket_count,
        })

if not items:
    raise RuntimeError(
        "品目を取得できませんでした。"
        "公式ページのHTML構造を確認してください。"
    )

# TypeScriptファイルとして出力
with open("wasteItems.ts", "w", encoding="utf-8") as file:
    file.write(
        "export type WasteItem = {\n"
        "  id: number;\n"
        "  name: string;\n"
        "  category: string;\n"
        "  fee: number;\n"
        "  ticketCount: number | null;\n"
        "};\n\n"
    )
    file.write(
        "export const wasteItems: WasteItem[] = "
        + json.dumps(items, ensure_ascii=False, indent=2)
        + ";\n"
    )

print(f"{len(items)} 件の品目を wasteItems.ts に出力しました。")
