# 三語一色 Design v2 Deliverables

## 内容

- `3go1iro_design_v2_research_and_design.md` — 調査メモ、設計原則、UIへの落とし込み
- `3go1iro_figma_implementation_guide_v2.md` — Figmaページ構成、Auto Layout、Variables、Prototype導線
- `3go1iro_design_v2_tokens.json` — セマンティックカラー、24色パレット、タイポグラフィ、コンポーネント寸法
- `3go1iro_design_v2_figma_palette.svg` — Figmaへ配置しやすい24色パレット
- `3go1iro_design_v2_board.png` — 高解像度デザインボード
- `3go1iro_design_v2_prototype.html` — ブラウザ確認用静的プロトタイプ
- `3go1iro_v2_screen_*.png` — 主要6画面の個別PNG

## Figmaでの使い方

1. Figmaで新規Design fileを作成。
2. `3go1iro_design_v2_board.png` をResearch/Overviewページへ配置。
3. `3go1iro_v2_screen_*.png` をMobile Screensページへ配置。
4. `3go1iro_design_v2_tokens.json` を見ながらVariablesに色を登録。
5. `3go1iro_figma_implementation_guide_v2.md` に沿って、WordInput / ColorChip / CalendarCell / DayCardをComponent化。

## 重要な設計判断

- カレンダーを主役にし、`みんなの日` は補助的な匿名フィードにする。
- 投稿はフォームではなく「儀式」にする。
- いいね数ではなく「色で返す」「3語で返す」を主反応にする。
- 色は自由RGBではなく、名前つき24色に固定する。
- 色だけで意味を伝えず、色名と3語を併記する。
