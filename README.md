# VSCode MiniMax Usage

<div align="center">

![Status bar example](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)

แสดงการใช้งาน [MiniMax Token Plan](https://platform.minimax.io/docs/token-plan/faq) บน Status Bar ของ VS Code

</div>

## วิธีติดตั้ง

### วิธีที่ 1: ติดตั้งจากไฟล์ .vsix
1. ดาวน์โหลดไฟล์ `.vsix` จาก [Releases](https://github.com/Piyabordee/minimax-usage/releases/latest)
2. ใน VS Code: ไปที่ **Extensions** → กด **...** (สามจุด) → **Install from VSIX...**
3. เลือกไฟล์ `.vsix` ที่ดาวน์โหลดมา
4. กด **Reload Window** เมื่อมีข้อความแจ้ง

### วิธีที่ 2: ผ่าน Command Line
```bash
code --install-extension minimax-usage-1.0.1.vsix
```

## วิธีใช้งาน

### 1. ขอ Token Plan Key
1. ไปที่ [MiniMax Platform](https://platform.minimax.io/docs/token-plan/faq)
2. ล็อกอินและคัดลอก Token Plan Key ของคุณ

### 2. ตั้งค่าใน VS Code
1. คลิกที่ `🔑 MiniMax: Set API Key` บน Status Bar (ด้านล่างขวา)
2. วาง Token Plan Key ของคุณ
3. Status Bar จะแสดง % การใช้งานทันที

### 3. ดูรายละเอียดเพิ่มเติม
- คลิกที่ Status Bar เพื่อดู **Details** (กราฟ + ข้อมูลดิบ)
- รันคำสั่ง **MiniMax Usage: Refresh** เพื่อดึงข้อมูลใหม่ทันที

## ตัวอย่างบน Status Bar

| สถานการณ์ | แสดง |
| --- | --- |
| ใช้งานได้ปกติ | `⚡ MiniMax 0% (10h)` |
| ใช้งานสูง | `⚡ MiniMax 85% (30m)` |
| ยังไม่ตั้ง API Key | `🔑 MiniMax: Set API Key` |
| เกิดข้อผิดพลาด | `⚠️ MiniMax: Error` |

หมายเหตุ: เวลาในวงเล็บ `(10h)` คือเวลาที่เหลือก่อน quota จะ reset

## คำสั่งที่มี

| คำสั่ง | คำอธิบาย |
| --- | --- |
| `MiniMax Usage: Set API Key` | ตั้งค่า Token Plan Key |
| `MiniMax Usage: Refresh` | ดึงข้อมูลการใช้งานใหม่ |
| `MiniMax Usage: Show Details` | แสดงรายละเอียดทั้งหมด |

## การตั้งค่า

| การตั้งค่า | ชนิด | ค่าเริ่มต้น | คำอธิบาย |
| --- | --- | --- | --- |
| `minimaxUsage.refreshIntervalMinutes` | `number` | `5` | ระยะเวลา refresh อัตโนมัติ (นาที) |

## API ที่ใช้

- **Endpoint:** `GET https://www.minimax.io/v1/token_plan/remains`
- **Auth:** `Authorization: Bearer <Token Plan Key>`

## ความต้องการ

- VS Code เวอร์ชัน 1.85.0 ขึ้นไป
- Token Plan Key ที่ถูกต้องจาก MiniMax

## สร้างไฟล์ .vsix เอง

```powershell
# เปลี่ยน version ใน package.json ก่อน
((Get-Content package.json) -replace '"version": "1.0.0"', '"version": "1.0.1"') | Set-Content package.json

# สร้างไฟล์ .vsix
npx vsce package
```

ไฟล์ที่ได้จะเป็น `minimax-usage-1.0.1.vsix`

## License

[MIT](LICENSE)

## แหล่งที่มา

Inspired by [vscode-zai-usage](https://github.com/j4rviscmd/vscode-zai-usage) by j4rviscmd