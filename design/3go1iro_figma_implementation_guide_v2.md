# 三語一色 Figma実装ガイド v2

## 1. ファイル構成

Figma内では以下のページに分ける。

1. `00 Research / Notes`
2. `01 Tokens`
3. `02 Components`
4. `03 Mobile Screens`
5. `04 Prototype`

## 2. インポート

- `3go1iro_design_v2_board.png` をResearchページへ配置。
- `3go1iro_v2_screen_*.png` をMobile Screensページへ配置。
- `3go1iro_design_v2_tokens.json` を見ながら、Figma Variablesに色を登録。

## 3. Variables

### Semantic

- `semantic/paper` = `#F8F1E8`
- `semantic/paper-elevated` = `#FFF9F1`
- `semantic/ink` = `#29241F`
- `semantic/muted` = `#776C61`
- `semantic/line` = `#E4D7C7`
- `semantic/primary` = `#60766E`

### Day Palette

`day/朝の白` から `day/コーヒー色` まで24色を登録する。

## 4. Auto Layout

### Mobile Frame

- Frame: 390×844
- Direction: Vertical
- Padding: 28 / 28 / 24 / 28
- Gap: 16
- Background: `semantic/paper-elevated`
- Radius: 38

### WordInput

- Direction: Horizontal
- Height: 104
- Padding: 24
- Gap: 16
- Radius: 22
- Variant: `state=empty|active|filled|warning|error`

### DayCard

- Direction: Vertical
- Padding: 24
- Gap: 20
- Radius: 34
- Background: selected `day/*`

### CalendarGrid

- Direction: Grid
- Columns: 7
- Gap: 7
- Cell visual size: 40–44
- Interaction hit area: 48

## 5. Prototype links

- Onboarding CTA → Post: 3 words
- Post filled / CTA → Color selection
- Color selection CTA → Calendar
- Calendar cell tap → Day detail
- `みんなの日` card `色を返す` → reply modal

## 6. QA checklist

- 色だけで状態を伝えていないか。
- 色名が必ず表示されているか。
- 本文テキストが4.5:1以上のコントラストか。
- 主要タップ領域が48px以上か。
- 3語入力で長文を入れにくいUIになっているか。
- 「いいね」「フォロワー数」が主役になっていないか。
