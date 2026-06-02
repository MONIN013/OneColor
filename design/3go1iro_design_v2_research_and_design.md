# 三語一色 Design v2 — Research Notes & Design落とし込み

## 0. 結論

前回の設計は「何ができるか」は伝わるが、「なぜ毎日開きたいか」が弱かった。三語一色の価値はSNSの機能量ではなく、**毎日を小さな標本として残す儀式性**にある。今回のデザインでは、カレンダーを主役にし、`みんなの日` は補助的な匿名フィードとして扱う。投稿ボタンよりも余白、いいねよりも色返しを優先する。

キービジュアルは「紙」「インク」「色標本」「カレンダー」。UIはきれいにしすぎず、紙やインクの質感を少し残す。画面密度を低くし、投稿後の静けさまで設計対象にする。

## 1. 調査から採用するノウハウ

### 1.1 美しさは機能の一部として扱う

Nielsen Norman Groupは、見た目がよいUIはユーザーに小さな使いにくさを許容させる一方、深刻な使いにくさは隠せないと説明している。三語一色では美しさを「装飾」ではなく、投稿体験の動機そのものとして使う。

**設計反映**

- 入力完了時に、投稿カードがその日の色へ変わる。
- カレンダーに残る見え方を投稿前にプレビューする。
- 影・角丸・色名・明朝体で、日記ではなく「標本」感を出す。

### 1.2 認知負荷を下げる

NN/gの10 heuristicsでは、状態の可視化、ユーザーの言葉で話すこと、エラー予防、思い出すより認識できることが重視されている。三語一色では、ユーザーに「3単語かどうか」を考えさせず、最初から3つの箱に分ける。

**設計反映**

- 3語入力は `[一] [二] [三]` の3カードで保証する。
- 色は自由なRGBではなく、24色の名前つきパレット。
- 投稿ボタン付近に `2 / 3 ことば` の状態を出す。
- 助詞や長文はブロックではなく確認UIでやわらかく制御する。

### 1.3 アクセシビリティを「世界観を壊さず」入れる

WCAG 2.2は通常テキストのコントラスト比を4.5:1以上、UI部品やグラフィックの必要な識別情報は3:1以上、ポインター入力対象は最低24×24 CSS pxとしている。Android Developersは、タッチUIでは48dp×48dp以上を推奨している。

**設計反映**

- 本文テキストは4.5:1以上を目標。
- 色チップには必ず色名を併記する。
- カレンダーの色だけで意味を伝えず、タップ後に3語と色名を表示する。
- 主要ボタン・タブ・投稿操作は48px以上のタップ領域にする。

### 1.4 Figma化しやすい設計にする

FigmaのAuto Layoutは、フレーム内要素を方向・間隔・padding・alignに基づいて自動配置し、内容変更に応答できる。三語一色では、WordInput、ColorChip、DayCard、CalendarCellをすべてAuto Layout前提で作る。

**設計反映**

- 画面は390×844を基準に、Auto Layoutで縦方向に構成。
- コンポーネントは状態 variant を持つ。
- 色は変数化し、DayPaletteとして24色を管理する。

## 2. Art Direction

### キーワード

- 静かな儀式
- 色標本
- 余白のある日記
- 紙のカレンダー
- 直接説明しない自己開示

### 非キーワード

- ポップすぎるSNS
- 数字で競わせるダッシュボード
- 感情診断アプリ
- グラデーション過多
- 「悲しい=青」のような決めつけ

## 3. 画面設計

### 3.1 Onboarding

目的は機能説明ではなく、世界観の理解。最初に `雨 / 改札 / 嘘` のような完成形を見せる。

### 3.2 Post: 3 words

投稿はフォームではなく、小さな儀式にする。3つの入力欄を大きく、明朝体で表示する。文ではなく言葉を置いている感覚を出す。

### 3.3 Color selection

色をRGBで選ばせない。24色パレットと「色の地図」を併用する。選択中の色はその日のカードに即時反映する。

### 3.4 Calendar

月表示は色のモザイク。詳細を開くまで3語は出さない。これにより、カレンダーは他人に見せても過剰に情報が漏れない。

### 3.5 Day detail

その日の色を背景に、3語を大きく出す。反応はいいねではなく、返ってきた色として残す。

### 3.6 みんなの日

通常のSNSタイムラインではなく、匿名の記録が静かに流れる `みんなの日`。閲覧は自分の記録を少なくとも1件残した後に開放し、いいね数や投稿者情報は出さない。

## 4. Design System

### Typography

- Display / Words: Noto Serif CJK JP, Hiragino Mincho ProN, Yu Mincho, serif
- UI / Labels: Noto Sans CJK JP, system-ui, sans-serif
- 英数字: Inter, system-ui

### Color

- Paper: `#F8F1E8`
- Paper Elevated: `#FFF9F1`
- Ink: `#29241F`
- Muted: `#776C61`
- Line: `#E4D7C7`
- Primary Moss: `#60766E`

### Day Palette

24色は `3go1iro_design_v2_tokens.json` を参照。Figmaでは `day/雨の青`, `day/遠い青` のように命名する。

### Components

#### WordInput

- Height: 104px
- Radius: 22px
- Padding: 24px
- States: empty / active / filled / warning / error
- Max: 8 chars

#### ColorChip

- Visual: 32px or 40px
- Touch target: 48px
- Label required

#### CalendarCell

- Visual: 40–44px
- Touch target: 48px
- States: empty / filled / selected / today / blank

#### DayCard

- Radius: 34px
- Uses selected day color as background
- Text foreground chosen by contrast

#### Reaction

- Types: 色で返す / 3語で返す
- No public like count in MVP

## 5. MVPで守るべき判断

1. 最初のホームはタイムラインにしない。自分の今日を最優先。
2. いいね数・ランキング・フォロワー数を前面に出さない。
3. 色は自由選択にしない。固定24色にする。
4. 感情名で色を分類しない。質感名にする。
5. カレンダーの空白を「失敗」に見せない。

## 6. 生成物

- `3go1iro_design_v2_board.png` — Figmaに貼れる高解像度デザインボード
- `3go1iro_design_v2_tokens.json` — 色・タイポ・コンポーネント設計
- `3go1iro_design_v2_prototype.html` — ブラウザで確認できる静的プロトタイプ
- `3go1iro_v2_screen_*.png` — 各画面PNG

## 7. References

- Nielsen Norman Group, The Aesthetic-Usability Effect: https://www.nngroup.com/articles/aesthetic-usability-effect/
- Nielsen Norman Group, 10 Usability Heuristics for User Interface Design: https://www.nngroup.com/articles/ten-usability-heuristics/
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Android Developers, Make apps more accessible: https://developer.android.com/guide/topics/ui/accessibility/apps
- Figma Help, Guide to Auto Layout: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout
- Figma Help, Import files to the file browser: https://help.figma.com/hc/en-us/articles/360041003114-Import-files-to-the-file-browser
