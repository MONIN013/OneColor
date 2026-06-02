# OneColor / 三語一色 スマホUI/UX監査レポート

作成日: 2026-05-31  
対象: `apps/mobile` の現行 Expo React Native 実装、`design/` の v2 設計資料  
監査方法: コードと設計資料の静的監査。実機、シミュレータ、スクリーンリーダー、ネットワークスロットリング、ストア審査環境での実測は未実施。

注記: この監査レポートは旧 `似た日` 画面時点の履歴です。2026-06-02 時点の現行仕様では `似た日` を `みんなの日` に置き換え、匿名の新着フィードとして扱います。

## 1. 総評

### 現在のUIの全体評価

OneColor / 三語一色は、「三つのことばと一つの色で日を残す」という中核体験が明確で、画面単位の役割も比較的整理されています。READMEでも日々を三語と一色で記録するアプリと説明されており、実装上もオンボーディング、三語入力、色選択、今日の記録、カレンダー、似た日、プロフィールに分かれています。事実: `README.md:1-3`, `apps/mobile/app/(tabs)/_layout.tsx:26-54`。

一方で、design v2 が掲げる「カレンダーを主役にする」「投稿はフォームではなく儀式にする」「主要タップ領域は48px以上」「状態 variant を持つ」という方針に対して、現行実装はまだ MVP の骨格段階です。特にカレンダー導線、状態設計、タップ領域、オフライン/通信失敗時の説明はスマホアプリとして優先改善が必要です。事実: `design/3go1iro_design_v2_research_and_design.md:5-7`, `design/3go1iro_design_v2_research_and_design.md:34-41`, `design/3go1iro_design_v2_tokens.json:226-267`。

### 最も重大な問題 5個

1. カレンダー主役の設計思想に対して、復帰時の着地点とタブ順が `今日の記録` 起点になっている。事実: `apps/mobile/app/index.tsx:17-18`, `apps/mobile/app/(tabs)/_layout.tsx:26-39`, `design/3go1iro_design_v2_research_and_design.md:5-7`。
2. カレンダーの `月/年` が操作できる見た目だが、実装上は切り替えや月移動がない。事実: `apps/mobile/app/(tabs)/calendar.tsx:35-43`, `apps/mobile/src/state/AppState.tsx:65-66`。
3. `似た日`、エラー再読み込み、フィルターなど一部のタップ領域が48px基準を満たしていない。事実: `apps/mobile/app/(tabs)/near.tsx:167-170`, `apps/mobile/app/(tabs)/near.tsx:238-246`, `apps/mobile/src/components/ErrorBanner.tsx:42-48`, `design/3go1iro_design_v2_tokens.json:226-229`。
4. loading / empty / error の区別が弱く、特に `似た日` で「未保存」「該当なし」「通信失敗」「読み込み中」が同じ空状態に見えやすい。事実: `apps/mobile/app/(tabs)/near.tsx:54-57`, `apps/mobile/src/state/AppState.tsx:138-157`。
5. `今日の記録` タブが、保存済み draft の日付を `selectedDate` に復元するため、名前と表示内容がずれる可能性がある。事実: `apps/mobile/src/state/AppState.tsx:229-256`, `apps/mobile/app/(tabs)/day.tsx:49-50`。

### 最も良い点 5個

1. 三語入力、色選択、日カードという中核フローが短く、価値体験までの道筋が明確。事実: `apps/mobile/app/onboarding.tsx:12-15`, `apps/mobile/app/post.tsx:23-69`, `apps/mobile/app/color.tsx:27-32`。
2. 固定24色、色名併記、推奨文字色を持つため、自由RGBよりも迷いと色だけ依存を抑えやすい。事実: `packages/shared/src/index.ts:93-118`, `design/3go1iro_design_v2_research_and_design.md:27-29`。
3. 明朝体を言葉、ゴシック体をUIラベルに使う方向性が design と実装で揃っている。事実: `design/3go1iro_design_v2_research_and_design.md:99-103`, `apps/mobile/src/theme.ts:6-12`。
4. `Screen`、`AppButton`、`ErrorBanner` で最低限の共通化があり、改善の集約先がある。事実: `apps/mobile/src/components/Screen.tsx:12-29`, `apps/mobile/src/components/AppButton.tsx:24-40`, `apps/mobile/src/components/ErrorBanner.tsx:9-23`。
5. いいね数、フォロワー、ランキングを前面に出しておらず、SNS圧を下げる設計方針に近い。事実: `design/3go1iro_design_v2_research_and_design.md:151-157`, `apps/mobile/app/(tabs)/near.tsx:54-90`。

### スマホアプリとして特に問題になりそうな点

- 片手操作時に押す頻度の高い `色を返す`、フィルター、再読み込みが小さい。
- 日本語IME表示時の post 画面で、入力欄や `色を選ぶ` CTA が隠れる可能性が未確認。事実: `apps/mobile/src/components/Screen.tsx:16-23`, `apps/mobile/app/post.tsx:23-69`。
- 状態がグローバルな `apiError` と `refreshing` に寄っており、画面別の失敗理由や進行状態が伝わりにくい。事実: `apps/mobile/src/state/AppState.tsx:68-78`, `apps/mobile/src/state/AppState.tsx:117-213`。
- 実機では `EXPO_PUBLIC_API_BASE_URL` が未設定だと API 接続に失敗しやすい。事実: `apps/mobile/src/lib/api.ts:14-20`, `README.md:26-32`。

### 追加確認が必要な点

- 実機 iOS / Android での表示、セーフエリア、戻る操作、日本語IME、Dynamic Type / 文字サイズ拡大。
- スクリーンリーダー読み上げ、フォーカス順、外部キーボード操作。
- 通知、権限、ストア説明、評価依頼、サポート導線、計測イベントは要件自体が未確認。
- ビジネス目的、KPI、対象ユーザー属性、競合、法務制約は未確認。

## 2. スコアリング

| 評価項目 | 点 | 根拠 |
| --- | ---: | --- |
| 目的適合性 | 3 | 中核体験は明確だが、カレンダー主役と今日起点が未整理。 |
| モバイル利用文脈 | 3 | 短時間入力向きだが、IME、片手、低速回線の検証不足。 |
| 情報設計 | 2 | `今日の記録`、カレンダー、プロフィールの優先順位が揺れている。 |
| ナビゲーション | 2 | タブは明確だが、カレンダー月/年、戻る、日付遷移に曖昧さがある。 |
| ユーザーフロー | 3 | 初回投稿フローは短い。再編集、skip、似た日の状態分岐が弱い。 |
| 画面構成 | 3 | 余白とカード構成は良いが、一部導線がスクロール下や小ターゲットに寄る。 |
| 片手操作 | 2 | 主要CTAは大きいが、頻出サブ操作が小さい。 |
| タップ領域 | 2 | `AppButton` は良いが、近似日返信、filter、error retry が不足。 |
| ジェスチャー | 2 | pull-to-refresh はあるが、代替説明や戻る/閉じるの整理が不足。 |
| 視覚階層 | 4 | 色カード、三語、CTA の強弱は比較的良い。 |
| タイポグラフィ | 3 | 世界観は強いが、大きい文字設定時の折り返し未確認。 |
| 色・コントラスト | 3 | palette は推奨文字色を持つが、一部 recommendedText のコントラスト値は4.5未満。 |
| コンポーネント | 3 | 共通部品はあるが、状態 variant と仕様同期が不足。 |
| CTA | 3 | 文言は具体的だが、カレンダーや redo の優先CTA整理が必要。 |
| フォーム | 3 | 三つの入力欄は明確。count、active/error、IME対応が不足。 |
| 状態表示 | 2 | global loading/error はあるが、画面別の文脈が不足。 |
| エラー設計 | 2 | 再読み込みはあるが、原因と復旧方法が粗い。 |
| 空状態 | 2 | 空状態は存在するが、理由別に分かれていない。 |
| ローディング状態 | 1 | 初期 spinner と refresh indicator 以外が薄い。 |
| アクセシビリティ | 2 | accessibilityLabel は一部あるが、target size、focus、読み上げ順が未整備。 |
| レスポンシブ・端末差分 | 2 | portrait/light 前提。iPad support は app.json にあるが最適化は未確認。 |
| OS慣習 | 2 | Expo標準に乗る部分はあるが、iOS/Android別の戻る・sheet設計は未確認。 |
| 権限許可 | 3 | 現状は権限要求が不要そう。将来機能の設計は未確認。 |
| プッシュ通知 | 2 | 現状未設計。必須ではないが、継続利用施策として未確認。 |
| オンボーディング | 3 | 完成形提示は良い。skip の保存と再表示制御に問題。 |
| アプリライフサイクル | 2 | draft 永続化はあるが、復帰時の今日/選択日や stale data が未整理。 |
| オフライン対応 | 1 | API失敗時のバナーはあるが、保存待ちや同期状態がない。 |
| パフォーマンス体験 | 3 | 画像/動画は重くない。実測と slow API 表示は未確認。 |
| UXライティング | 3 | 短い文言が多い。空/エラー文は原因と次行動が弱い。 |
| 信頼性・安全性 | 3 | 高リスク操作は少ない。匿名ID/API接続/データ管理説明は不足。 |
| 一貫性 | 3 | 色/フォントは一貫。docs、prototype、実装の差分が残る。 |
| デザインシステム | 3 | token/docs はある。実装 component variant への落とし込みが未完。 |
| 計測・改善 | 1 | イベント設計、KPI、A/Bテスト前提が未確認。 |
| 総合評価 | 2.7 | 体験の核はあるが、スマホ品質としては状態・操作・IAを優先改善すべき段階。 |

## 3. 問題点一覧

### 3.1 カレンダー主役設計と初期着地点がずれている

- 対象画面: 初期遷移、タブナビゲーション、カレンダー
- 対象箇所: 復帰時 redirect、タブ順
- 問題内容: design v2 はカレンダーを主役にすると明記しているが、復帰時は `/(tabs)/day` へ遷移し、タブ順も `今日の記録` が先頭。
- 根拠: 事実: `design/3go1iro_design_v2_research_and_design.md:5-7`, `apps/mobile/app/index.tsx:17-18`, `apps/mobile/app/(tabs)/_layout.tsx:26-39`。
- ユーザーへの影響: 毎日の蓄積を見るアプリなのか、今日だけを入力するアプリなのかが初期体験で曖昧になる。
- 深刻度: High
- 改善優先度: P1
- 改善案: 復帰時の既定着地点を「今日の記録」とするか「カレンダー」とするかを決め、タブ順・オンボーディング後遷移・保存後遷移を統一する。
- 受け入れ条件: 初回、投稿後、翌日復帰、カレンダー選択後の全ケースで、現在地と表示内容が一致する。
- 追加で確認すべきこと: ユーザーに最初に見せたい価値が「今日を書く」か「残った日を見る」か。

### 3.2 カレンダーの `月/年` が押せそうだが動かない

- 対象画面: カレンダー
- 対象箇所: `表示切り替え`, `月`, `年`
- 問題内容: セグメントコントロールに見えるが、現行コードでは Pressable ではなく Text で、年表示や月移動がない。
- 根拠: 事実: `apps/mobile/app/(tabs)/calendar.tsx:35-43`, `apps/mobile/src/state/AppState.tsx:65-66`。
- ユーザーへの影響: 操作できると期待してタップし、反応がないことで壊れている印象を与える。
- 深刻度: High
- 改善優先度: P0
- 改善案: 即時対応では `年` を削除するか disabled 表現にする。短期では月移動と年表示を実装する。
- 受け入れ条件: 表示される操作要素はすべてタップ時に明確な反応を返す。
- 追加で確認すべきこと: MVPで年表示が本当に必要か。

### 3.3 カレンダーセルと詳細遷移の契約が design と違う

- 対象画面: カレンダー
- 対象箇所: 日付セル、下部サマリー行
- 問題内容: Figma guide はセルタップで Day detail とするが、現行実装ではセルは選択のみ、別の summary row で day へ進む。
- 根拠: 事実: `design/3go1iro_figma_implementation_guide_v2.md:70-76`, `apps/mobile/app/(tabs)/calendar.tsx:62-91`。
- ユーザーへの影響: 日付をタップした後に何が起きたか気づきにくく、詳細へ進む手数も増える。
- 深刻度: Medium
- 改善優先度: P1
- 改善案: セルタップで詳細を開く、またはセル選択+summary row の2段階操作を明示する。MVPではセルタップで day へ遷移する方が自然。
- 受け入れ条件: カレンダーの日付を押した後、ユーザーが次に何をすべきか迷わない。
- 追加で確認すべきこと: カレンダー内で複数日を比較する操作を将来入れるか。

### 3.4 WordInput の状態設計が不足している

- 対象画面: 三語入力
- 対象箇所: 3つの入力カード、CTA周辺
- 問題内容: design では empty / active / filled / warning / error と `2 / 3 ことば` の状態表示を想定しているが、実装は filled 背景と残り字数のみ。
- 根拠: 事実: `design/3go1iro_design_v2_research_and_design.md:27-30`, `design/3go1iro_design_v2_tokens.json:231-241`, `apps/mobile/app/post.tsx:23-37`, `apps/mobile/app/post.tsx:78-116`。
- ユーザーへの影響: なぜ `色を選ぶ` が disabled なのか、あと何をすれば進めるのかが瞬時に分かりにくい。
- 深刻度: Medium
- 改善優先度: P1
- 改善案: CTA直上に `2 / 3 ことば` を追加し、active focus と error/warning を component state として定義する。
- 受け入れ条件: 未入力、入力中、3語完了、8字超過試行、エラー時の見た目と読み上げが区別できる。
- 追加で確認すべきこと: 助詞や長文をどの程度制限するか。

### 3.5 一部タップ領域がスマホ基準より小さい

- 対象画面: 似た日、ErrorBanner、カレンダー
- 対象箇所: filter pill、`色を返す`、`再読み込み`、カレンダーセル
- 問題内容: design token の preferred 48px に対し、filter pill は42、reply button は32、error retry は32。
- 根拠: 事実: `design/3go1iro_design_v2_tokens.json:226-229`, `apps/mobile/app/(tabs)/near.tsx:167-170`, `apps/mobile/app/(tabs)/near.tsx:238-246`, `apps/mobile/src/components/ErrorBanner.tsx:42-48`。
- ユーザーへの影響: 片手操作、移動中、大型端末、揺れる環境で誤タップや押し損ねが増える。
- 深刻度: High
- 改善優先度: P0
- 改善案: すべての Pressable 系サブ操作に minHeight 44以上、主要操作は48以上を適用する。
- 受け入れ条件: 主要/頻出タップ要素が最低44px、できれば48px以上になる。
- 追加で確認すべきこと: 320px幅での折り返しと隣接間隔。

### 3.6 loading / empty / error が画面別に分かれていない

- 対象画面: 似た日、今日の記録、カレンダー、色選択
- 対象箇所: 空状態、ErrorBanner、RefreshControl
- 問題内容: refresh 中、API失敗、未保存、該当なしが区別されにくい。`nearDays.length === 0` は常に同じ文言。
- 根拠: 事実: `apps/mobile/app/(tabs)/near.tsx:54-57`, `apps/mobile/src/state/AppState.tsx:138-157`, `apps/mobile/src/components/Screen.tsx:16-23`。
- ユーザーへの影響: 何を待てばよいか、再試行すべきか、まず記録を作るべきかが分からない。
- 深刻度: High
- 改善優先度: P1
- 改善案: 画面ごとに `loading`, `empty`, `error`, `offline`, `needsBaseEntry` を分け、短い行動導線を出す。
- 受け入れ条件: `似た日` で未保存、読み込み中、該当なし、通信失敗が別文言になる。
- 追加で確認すべきこと: APIから未保存ベース日を識別できるか。

### 3.7 グローバルな `apiError` / `refreshing` が画面文脈を壊しやすい

- 対象画面: 全API利用画面
- 対象箇所: `AppState`
- 問題内容: entries、near days、returned colors、save、returnColor が同じ `apiError` と `refreshing` を共有している。
- 根拠: 事実: `apps/mobile/src/state/AppState.tsx:68-78`, `apps/mobile/src/state/AppState.tsx:117-213`, `apps/mobile/src/state/AppState.tsx:305-332`。
- ユーザーへの影響: ある画面のバックグラウンド失敗が別画面に表示されたり、保存中なのか読み込み中なのかが分かりにくくなる。
- 深刻度: Medium
- 改善優先度: P1
- 改善案: `entriesStatus`, `nearStatus`, `reactionStatus`, `saveStatus` のように操作別状態へ分ける。
- 受け入れ条件: 保存中CTA、一覧refresh、modal送信が別々に disabled/loading/error を表現する。
- 追加で確認すべきこと: 状態管理を Context のまま拡張するか、画面単位hookに分けるか。

### 3.8 オンボーディング skip が永続化されない

- 対象画面: Onboarding
- 対象箇所: `今日の記録を見る`
- 問題内容: `今日を残す` は `markOnboardingSeen` を呼ぶが、skip は `router.replace("/(tabs)/day")` のみ。
- 根拠: 事実: `apps/mobile/app/onboarding.tsx:12-15`, `apps/mobile/app/onboarding.tsx:38-46`, `apps/mobile/src/state/AppState.tsx:294-297`。
- ユーザーへの影響: ユーザーが明示的にスキップしたのに、次回起動で再度オンボーディングが出る可能性がある。
- 深刻度: Medium
- 改善優先度: P1
- 改善案: skip でも `markOnboardingSeen` を呼ぶ。後から見返す導線が必要ならプロフィールや設定に移す。
- 受け入れ条件: `今日を残す` と `今日の記録を見る` のどちらでも次回起動時にオンボーディングが再表示されない。
- 追加で確認すべきこと: skip を「今回だけ閉じる」と扱いたい意図があるか。

### 3.9 `今日の記録` が今日以外の日を表示しうる

- 対象画面: 今日の記録
- 対象箇所: draft復元、selectedDate、ヘッダー
- 問題内容: 保存draftの日付を `selectedDate` に復元するため、タブ名は `今日の記録` でも表示は過去/別日になる可能性がある。
- 根拠: 事実: `apps/mobile/src/state/AppState.tsx:229-256`, `apps/mobile/app/(tabs)/day.tsx:49-50`。
- ユーザーへの影響: 今日の記録を見ているつもりで、別日の内容を編集・保存する誤解が起きる。
- 深刻度: High
- 改善優先度: P1
- 改善案: タブは常に today を表示するか、タブ名を `記録` / `この日の記録` にする。カレンダー選択日は別 route/state として扱う。
- 受け入れ条件: タブ名、header日付、保存対象日が常に一致する。
- 追加で確認すべきこと: 過去日の再編集を MVP に含めるか。

### 3.10 プロフィールの数値表示が design 方針と衝突しうる

- 対象画面: プロフィール
- 対象箇所: `色`, `記録`, `語` の stats
- 問題内容: design は数字で競わせるダッシュボードを非キーワードとし、ランキング等を避ける方針。現行プロフィールは数値を前面に出す。
- 根拠: 事実: `design/3go1iro_design_v2_research_and_design.md:63-69`, `apps/mobile/app/(tabs)/profile.tsx:46-50`。
- ユーザーへの影響: 静かな記録体験よりも量を増やす方向に注意が向く。
- 深刻度: Medium
- 改善優先度: P2
- 改善案: 数値statsを二次情報に下げ、今日の色/最近の標本/設定導線を主にする。競争性のある表現は避ける。
- 受け入れ条件: プロフィールが「量のダッシュボード」ではなく「自分の記録設定と状態確認」に見える。
- 追加で確認すべきこと: プロフィールの本来目的。設定、アカウント、統計のどれか。

### 3.11 日本語IMEとキーボード回避が未確認

- 対象画面: 三語入力
- 対象箇所: `Screen`, `TextInput`, CTA
- 問題内容: `ScrollView` はあるが `KeyboardAvoidingView` がなく、IME表示時に入力欄やCTAが隠れないか未確認。
- 根拠: 事実: `apps/mobile/src/components/Screen.tsx:16-23`, `apps/mobile/app/post.tsx:23-69`。
- ユーザーへの影響: 入力完了後の `色を選ぶ` が見えず、スクロールやキーボード閉じが必要になる可能性がある。
- 深刻度: Medium
- 改善優先度: P1
- 改善案: 実機で日本語IMEを確認し、必要なら `KeyboardAvoidingView` と footer CTA の表示ルールを追加する。
- 受け入れ条件: 3つ目の入力中でもCTAの状態が確認でき、キーボードを閉じずに次へ進める。
- 追加で確認すべきこと: iOS / Android / Web で挙動差があるか。

### 3.12 実機API接続失敗時の説明が不足する

- 対象画面: API利用画面全般
- 対象箇所: API base URL、ErrorBanner
- 問題内容: 物理端末では localhost が端末自身を指すため、LAN URL設定が必要。READMEには記載があるが、アプリ内では接続不可理由が分からない。
- 根拠: 事実: `apps/mobile/src/lib/api.ts:14-20`, `README.md:26-32`, `apps/mobile/src/components/ErrorBanner.tsx:14-20`。
- ユーザーへの影響: 開発・テスト時に「データがない」のか「APIに届かない」のか判別しにくい。
- 深刻度: Medium
- 改善優先度: P2
- 改善案: 開発ビルドでは API base URL と接続失敗理由を分かる形で表示する。一般ユーザー向け文言は技術用語を避ける。
- 受け入れ条件: API停止、URL誤り、サーバーエラーが少なくとも開発者に識別可能。
- 追加で確認すべきこと: 本番API URLと環境切替の方針。

### 3.13 Disabled CTA とエラーが支援技術に十分伝わらない

- 対象画面: 三語入力、色選択、似た日、全エラー表示
- 対象箇所: `AppButton`, `ErrorBanner`
- 問題内容: `AppButton` は `disabled` を渡すが、明示的な `accessibilityState={{ disabled }}` や disabled 理由の表示がない。`ErrorBanner` も alert / live region 相当の指定がなく、スクリーンリーダーにエラー更新が伝わりにくい。
- 根拠: 事実: `apps/mobile/src/components/AppButton.tsx:24-40`, `apps/mobile/src/components/ErrorBanner.tsx:14-20`, `apps/mobile/app/post.tsx:51-68`, `apps/mobile/app/color.tsx:85-92`。
- ユーザーへの影響: 視覚的にボタンが無効でも、支援技術利用者には理由や状態変化が伝わりにくい。エラー発生後に再試行すべきことも見落とされる。
- 深刻度: High
- 改善優先度: P1
- 改善案: `AppButton` に `accessibilityState={{ disabled, busy }}` を追加し、disabled CTA 近くに短い理由を出す。`ErrorBanner` は `accessibilityRole="alert"` または React Native の live region 指定を検討する。
- 受け入れ条件: 3語未入力、保存中、API失敗時に、読み上げでも状態と次行動が分かる。
- 追加で確認すべきこと: iOS VoiceOver / Android TalkBack での実際の読み上げ順。

### 3.14 カレンダー選択状態が読み上げに出ない

- 対象画面: カレンダー
- 対象箇所: 日付セル
- 問題内容: 選択日は枠線で視覚表示されるが、`accessibilityState={{ selected }}` がなく、読み上げでは現在選択中の日が分からない。
- 根拠: 事実: `apps/mobile/app/(tabs)/calendar.tsx:62-86`, `apps/mobile/app/(tabs)/calendar.tsx:196-198`。
- ユーザーへの影響: スクリーンリーダー利用者が、どの日付を選んだか確認しにくい。
- 深刻度: Medium
- 改善優先度: P2
- 改善案: 日付セルに `accessibilityState={{ selected }}` を追加し、今日/空白/記録済みも読み上げラベルに含める。
- 受け入れ条件: TalkBack / VoiceOver で選択中の日が明示される。
- 追加で確認すべきこと: 今日のセルを別状態として扱うか。

### 3.15 初期ロードが無音の空白またはラベルなしスピナーになる

- 対象画面: 起動直後
- 対象箇所: root layout、index route
- 問題内容: フォントロード中は `return null`、state 準備中はラベルなし `ActivityIndicator` のみ。
- 根拠: 事実: `apps/mobile/app/_layout.tsx:16-27`, `apps/mobile/app/index.tsx:9-14`。
- ユーザーへの影響: 低速端末や初回起動時に、アプリが固まったように見える。支援技術利用者にも読み込み中であることが伝わりにくい。
- 深刻度: Medium
- 改善優先度: P2
- 改善案: フォントロード中も簡易 splash / loading view を表示し、`ActivityIndicator` にラベルと読み込み文言を添える。
- 受け入れ条件: 起動直後に常に視覚/読み上げ両方で読み込み状態が分かる。
- 追加で確認すべきこと: Expo splash screen を使うか、React view で揃えるか。

### 3.16 色返しモーダルの焦点管理が未設計

- 対象画面: 似た日
- 対象箇所: 色返し modal
- 問題内容: modal に明示的なモーダル性、初期フォーカス、閉じるヒント、modal内エラー表示が見当たらない。色返し失敗時は画面上部の `ErrorBanner` 更新になり、modalを見ているユーザーから見えにくい。
- 根拠: 事実: `apps/mobile/app/(tabs)/near.tsx:95-135`, `apps/mobile/app/(tabs)/near.tsx:107-132`, `apps/mobile/app/(tabs)/near.tsx:33-42`。
- ユーザーへの影響: 支援技術利用者や小画面ユーザーが、modal内で現在地、選択対象、失敗理由を把握しづらい。
- 深刻度: Medium
- 改善優先度: P2
- 改善案: modal panel に読み上げ用タイトル/説明、閉じるヒント、modal内エラー、送信中の個別状態を追加する。
- 受け入れ条件: modalを開いた直後、支援技術でタイトル、対象の三語、閉じる操作、24色選択の文脈が分かる。
- 追加で確認すべきこと: React Native Modal の iOS / Android 読み上げ挙動。

## 4. スマホ特有の重点チェック

- 片手操作しやすいか: 部分的。主要 `AppButton` は minHeight 52 で良いが、`色を返す` など頻出操作が小さい。事実: `apps/mobile/src/components/AppButton.tsx:45-52`, `apps/mobile/app/(tabs)/near.tsx:238-246`。
- タップしやすいか: 部分的。48px基準を満たすものと満たさないものが混在。
- 画面が情報過多ではないか: 概ね良い。カレンダーと色選択は密度が高く、320px幅確認が必要。
- キーボード表示時に入力欄やCTAが隠れないか: 未確認。`KeyboardAvoidingView` はない。
- 戻る、閉じる、キャンセルが自然か: 部分的。redo path の `戻る`、色選択の `戻る`、modal の `閉じる` はあるが、OS別戻ると状態破棄の扱いは未確認。
- 権限要求のタイミングが適切か: 現状、権限要求機能は確認できない。不要な権限要求がない点は良い。
- 通知許可の説明が十分か: 通知機能自体が未確認。
- オフラインや通信不安定時に破綻しないか: 不十分。入力draftは残るが、保存待ち/同期失敗/再送設計がない。
- アプリ中断・復帰時に状態が保たれるか: draft は AsyncStorage に保存されるが、復帰時に今日以外の selectedDate になりうる。
- iOS / Android の慣習と矛盾していないか: Expo標準に乗る部分はあるが、sheet、戻る、タブレット、Dynamic Type は未確認。
- 文字サイズ拡大に耐えるか: 未確認。3語入力の横並び補助テキスト、3列パレット、near modal の3列色選択は崩れやすい候補。事実: `apps/mobile/app/post.tsx:78-116`, `apps/mobile/app/color.tsx:154-183`, `apps/mobile/app/(tabs)/near.tsx:289-318`。
- スクリーンリーダーで状態が伝わるか: 不十分。disabled、selected、error、modal busy の読み上げ指定が不足している。

## 5. 画面別チェック

### 5.1 Onboarding

- この画面の目的: 完成形と世界観を見せ、最初の記録へ進める。
- ユーザーが達成すべきタスク: `今日を残す` または `今日の記録を見る` を選ぶ。
- 主要CTA: `今日を残す`。
- 迷いやすい箇所: skip が次回も onboarding を出す可能性。
- 離脱しやすい箇所: サンプル表示が実データなのか説明がない点。
- 片手操作上の問題: 主CTAは問題が少ない。skipは小さめで下部余白次第。
- タップ領域の問題: skip の Pressable に明示 minHeight がない。事実: `apps/mobile/app/onboarding.tsx:44-46`, `apps/mobile/app/onboarding.tsx:128-134`。
- OS慣習とのズレ: 初回説明を skip した後の永続化が期待とずれる。
- 改善案: skip でも seen を保存し、後から確認できる導線を設定/プロフィールに置く。
- 必要な状態設計: 通常、pressed、loading、success、disabled。error は AsyncStorage 失敗時のみ。

### 5.2 Post: 三語入力

- この画面の目的: 今日または選択日の三語を入力する。
- ユーザーが達成すべきタスク: 3つの言葉を入力し、`色を選ぶ`。
- 主要CTA: `色を選ぶ`。
- 迷いやすい箇所: disabled の理由、あと何語必要か。
- 離脱しやすい箇所: 日本語IME表示時にCTAが見えない可能性。
- 片手操作上の問題: 入力欄は大きいが、上から順に3カードなので大型端末では上部が遠い。
- タップ領域の問題: 入力カードは十分。戻る/色を選ぶの2ボタン行は320px幅で要確認。
- OS慣習とのズレ: KeyboardAvoiding が未確認。
- 改善案: `2 / 3 ことば`、disabled 理由、`accessibilityState.disabled`、focus state、warning/error state、IME対応を追加する。
- 必要な状態設計: 通常、pressed、focus、loading、empty、error、success、disabled。

### 5.3 Color selection

- この画面の目的: 三語に対応する色を24色から選び保存する。
- ユーザーが達成すべきタスク: 色を選び、`この日を残す`。
- 主要CTA: `この日を残す`。
- 迷いやすい箇所: `選択中` が preview と strip の2箇所に重複。
- 離脱しやすい箇所: 24色グリッドが縦に長く、保存CTAまでスクロールが必要になる可能性。
- 片手操作上の問題: 画面上部の色選択と下部CTAの往復。
- タップ領域の問題: paletteChoice は minHeight 54 で良いが、3列の幅と色名折り返しは320pxで要確認。事実: `apps/mobile/app/color.tsx:154-183`。
- OS慣習とのズレ: 戻るはあるが、選択変更の破棄確認はない。
- 改善案: 選択中表示を1箇所に整理し、保存CTAを画面下固定にするか、保存直前プレビューを明確にする。
- 必要な状態設計: 通常、pressed、focus、loading、empty、error、success、disabled。

### 5.4 今日の記録

- この画面の目的: 選択日の記録と返ってきた色を見る。
- ユーザーが達成すべきタスク: 記録を確認し、必要なら `もう一度置く` または `この日を残す`。
- 主要CTA: 記録ありなら `もう一度置く`、記録なしなら `この日を残す`。
- 迷いやすい箇所: タブ名は今日だが、選択日が今日とは限らない可能性。
- 離脱しやすい箇所: 返ってきた色が0件の理由が分からない。
- 片手操作上の問題: CTAはカード下で押しやすい。
- タップ領域の問題: `AppButton` は十分。
- OS慣習とのズレ: day detail と tab home の役割が混在。
- 改善案: `今日の記録` と `この日の記録` の概念を分ける。返ってきた色の loading/empty を分ける。
- 必要な状態設計: 通常、pressed、focus、loading、empty、error、success、disabled。

### 5.5 カレンダー

- この画面の目的: 月内の記録を色のモザイクとして眺め、日付詳細へ進む。
- ユーザーが達成すべきタスク: 日付を選び、詳細へ進む。
- 主要CTA: 日付セルまたは summary row。
- 迷いやすい箇所: `月/年`、セル選択と詳細遷移の分離。
- 離脱しやすい箇所: 過去月/翌月に移動できない。
- 片手操作上の問題: 月/年が上部にあり、日付セルが小さい。
- タップ領域の問題: percentage-based cell は端末幅で変動し、48px保証がない。事実: `apps/mobile/app/(tabs)/calendar.tsx:178-185`。
- OS慣習とのズレ: セグメントに見える要素が操作不能。
- 改善案: まず `年` を削除または disabled 化し、セルタップの挙動を決める。短期で月移動を追加し、選択セルには `accessibilityState.selected` を付与する。
- 必要な状態設計: 通常、pressed、focus、loading、empty、error、success、disabled、today、selected、blank。

### 5.6 似た日

- この画面の目的: 自分の記録に近い日を見つけ、色を返す。
- ユーザーが達成すべきタスク: 色/語で絞り、近い日へ色を返す。
- 主要CTA: `色を返す` / `色を変える`。
- 迷いやすい箇所: 似た日がない理由、未保存日との関係、返す色の送信状態。
- 離脱しやすい箇所: 空状態、modal内の24色選択。
- 片手操作上の問題: `色を返す` が小さく、modalの色選択は下部だが3列で密度が高い。
- タップ領域の問題: filter 42、reply 32、modal choice 54。replyは不足。事実: `apps/mobile/app/(tabs)/near.tsx:167-170`, `apps/mobile/app/(tabs)/near.tsx:238-246`, `apps/mobile/app/(tabs)/near.tsx:289-300`。
- OS慣習とのズレ: bottom sheet風 modal だが、drag close はなく、閉じるのみ。
- 改善案: 空状態を理由別に分け、返信ボタンを48px化し、modal送信中の個別loading、modal内エラー、モーダル性/閉じるヒントを出す。
- 必要な状態設計: 通常、pressed、focus、loading、empty、error、success、disabled、selected。

### 5.7 プロフィール

- この画面の目的: 現状は今日の記録サマリーと記録量を表示する。
- ユーザーが達成すべきタスク: 自分の状態を確認する。
- 主要CTA: なし。
- 迷いやすい箇所: プロフィールで何をすればよいか不明。
- 離脱しやすい箇所: 画面が display-only で、設定やデータ管理導線がない。
- 片手操作上の問題: 操作要素がほぼない。
- タップ領域の問題: 該当なし。
- OS慣習とのズレ: プロフィール/設定タブに期待されるログアウト、データ削除、通知設定などが未確認。
- 改善案: 数字statsを下げ、設定、データ管理、オンボーディング再表示、匿名ID説明などの役割を整理する。
- 必要な状態設計: 通常、loading、empty、error、success。

## 6. フロー別チェック

### 6.1 初回記録フロー

- フロー名: Onboarding -> Post -> Color -> Day
- 開始条件: 初回起動、`hasSeenOnboarding === false`
- 完了条件: 三語と色が保存され、今日の記録に表示される
- 現在のステップ数: 4画面
- 削減できるステップ: 大きく削る必要はない。保存後の着地点は要整理。
- 離脱しやすい地点: 三語入力の disabled CTA、色選択の長いパレット。
- エラーが起きやすい地点: API保存、API URL未設定、IME表示。
- 改善案: 入力進捗を見せ、保存中/保存失敗をボタン付近に出す。
- 理想フロー: 完成形を見る -> 三語を入力 -> 色を選ぶ -> 保存完了が分かる -> 今日またはカレンダーで残ったことを確認。

### 6.2 オンボーディング skip フロー

- フロー名: Onboarding skip
- 開始条件: 初回起動で `今日の記録を見る` を押す
- 完了条件: 今日の記録へ遷移し、次回起動時に再表示されない
- 現在のステップ数: 1
- 削減できるステップ: なし
- 離脱しやすい地点: 次回起動時に再表示される可能性
- エラーが起きやすい地点: AsyncStorage保存が呼ばれていない
- 改善案: skipでも seen を保存する
- 理想フロー: skip -> 今日の記録 -> 次回は通常着地点

### 6.3 再編集フロー

- フロー名: Day -> もう一度置く -> Post -> Color -> Day
- 開始条件: 選択日に entry がある
- 完了条件: 既存値を元に更新保存される
- 現在のステップ数: 4
- 削減できるステップ: 色変更だけなら color へ直接進む導線もありうる
- 離脱しやすい地点: Post の戻る、保存対象日の誤解
- エラーが起きやすい地点: `今日の記録` と selectedDate のずれ
- 改善案: ヘッダーに日付を強く出し、戻る/破棄の意味を明確にする
- 理想フロー: 既存値を保持 -> 編集 -> 色確認 -> 更新完了

### 6.4 カレンダー閲覧フロー

- フロー名: Calendar -> Date select -> Day detail
- 開始条件: カレンダータブ表示
- 完了条件: 対象日の詳細または作成画面へ進む
- 現在のステップ数: 2から3
- 削減できるステップ: セルタップで詳細へ進めば1手削減
- 離脱しやすい地点: セルタップ後に summary row を押す必要がある点
- エラーが起きやすい地点: `月/年` の無反応
- 改善案: セルタップ挙動、月移動、空白日のCTAを整理する
- 理想フロー: 月を見る -> 日を押す -> その日の詳細/作成へ進む

### 6.5 似た日と色返しフロー

- フロー名: Near -> Filter -> Reply modal -> Return color
- 開始条件: 選択日に保存済み entry がある
- 完了条件: 近い日に返した色が保存・表示される
- 現在のステップ数: 3から4
- 削減できるステップ: modal内で selected color を選んだ瞬間に送信しているため、確認ステップはない
- 離脱しやすい地点: 空状態、modal内24色、送信中の無反応
- エラーが起きやすい地点: 未保存日、通信失敗、連打
- 改善案: 未保存時は「この日を残す」導線、送信中は該当色だけ loading/disabled、失敗時はmodal内に再試行
- 理想フロー: 近い日を見る -> 返す色を選ぶ -> 送信中/完了が分かる -> modalが閉じ、カードに反映

## 7. 優先改善ロードマップ

### 即時対応: 1〜3日で直すべきもの

- カレンダーの `年` 表示を削除または disabled 表現にし、押せそうな無反応UIをなくす。
- `near` の `色を返す`、filter、`ErrorBanner` の再読み込みを最低44px、できれば48pxへ広げる。
- onboarding skip でも `markOnboardingSeen` を呼ぶ。
- `似た日はまだありません。` を少なくとも「この日の記録を残すと、似た日が表示されます」と「似た日はまだありません」に分ける。
- `色を選ぶ` disabled 付近に `0 / 3 ことば` などの進捗を追加する。
- `AppButton` に disabled の accessibilityState、`ErrorBanner` に alert / live region 相当の指定を追加する。
- カレンダーセルに selected state の読み上げを追加する。

### 短期対応: 1〜2週間で直すべきもの

- カレンダーセルタップの挙動を決め、day detail へ直接遷移するか、2段階選択を明示する。
- `AppState` の `apiError` / `refreshing` を entries / near / reactions / save に分割する。
- Post 画面に active/focus/warning/error state を追加し、日本語IMEで実機確認する。
- `今日の記録` と selectedDate の扱いを整理し、今日専用と選択日詳細を分ける。
- 色選択と near modal の loading / disabled / success 表示を追加する。
- 起動時の font loading / ready loading を、ラベル付きの表示にする。
- near modal の初期フォーカス、閉じるヒント、modal内エラー表示を設計する。

### 中期対応: 1〜2か月で設計し直すべきもの

- 「今日起点」か「カレンダー起点」かをプロダクト方針として決め、初回、復帰、投稿後、カレンダー閲覧のIAを再設計する。
- プロフィールの目的を設定/データ管理/自分の標本のどれにするか決め、数字ダッシュボード感を下げる。
- design token と実装 component state を同期し、Figma component と React Native component の variant 対応表を作る。
- オフライン保存待ち、同期失敗、再送、低速APIの状態設計を追加する。
- 計測イベント、ユーザビリティテスト、アクセシビリティチェックを継続運用に入れる。

## 8. ユーザビリティテストで確認すべき仮説

### 仮説1: ユーザーは `月/年` を操作できると思う

- 確認方法: カレンダー画面を見せ、自由に前月や年表示を探してもらう。
- 成功基準: 5秒以内に「今は月表示のみ」と理解できる、または月移動手段を発見できる。
- 失敗した場合の改善方向: `年` 削除、月移動UI追加、セグメントを本当に操作可能にする。

### 仮説2: `色を選ぶ` が disabled の理由が伝わらない

- 確認方法: 0語、1語、2語入力状態で次に何をすればよいか発話してもらう。
- 成功基準: 参加者の80%以上が「あと何語必要か」を説明できる。
- 失敗した場合の改善方向: `2 / 3 ことば`、未入力カード強調、disabled理由の読み上げ。

### 仮説3: 似た日の空状態が「まだ記録していない」なのか「該当なし」なのか分からない

- 確認方法: 未保存日、保存済みだが該当なし、API失敗の3状態を見せて意味を説明してもらう。
- 成功基準: 参加者の80%以上が状態と次の行動を区別できる。
- 失敗した場合の改善方向: empty/error/loading/needs entry の文言とCTAを分ける。

### 仮説4: カレンダーセルを押した後、詳細へ進む方法が分かりにくい

- 確認方法: カレンダーから5月29日の詳細を開くタスクを行う。
- 成功基準: 迷いなく1から2操作で day detail に到達する。
- 失敗した場合の改善方向: セルタップで直接遷移、summary row の視覚強度を上げる、矢印/CTA文言を明示する。

### 仮説5: `今日の記録` が今日以外を表示するとユーザーが混乱する

- 確認方法: 過去日draft復元またはカレンダー選択後に `今日の記録` タブを見せ、何日の記録だと思うか聞く。
- 成功基準: 参加者の80%以上が表示日と保存対象日を正しく答える。
- 失敗した場合の改善方向: 今日専用タブと選択日詳細を分離、またはタブ名変更。

### 仮説6: 数字statsは静かな記録体験より達成量を意識させる

- 確認方法: プロフィールを見せ、何を評価されていると感じるか聞く。
- 成功基準: 数量競争ではなく自分の記録確認と解釈される。
- 失敗した場合の改善方向: 数字を二次情報にし、色/最近の記録/設定を主役にする。

### 仮説7: 支援技術利用時に disabled / selected / error / modal 状態が分からない

- 確認方法: VoiceOver / TalkBack で三語入力、カレンダー日付選択、API失敗、色返しmodalを操作する。
- 成功基準: disabled理由、選択中日付、エラー、modalの閉じ方を読み上げだけで理解できる。
- 失敗した場合の改善方向: accessibilityState、alert/live region、modal label、focus順、補助文言を追加する。

## 9. 最終提案

最も重要な改善方針は、`三語一色` を「入力できるアプリ」から「毎日が静かに残り、迷わず戻ってこられるスマホ体験」へ寄せることです。

次に作るべき成果物は、優先順に以下です。

1. モバイルユーザーフロー: 初回、復帰、再編集、カレンダー、似た日、オフラインを含める。
2. 状態設計一覧: loading / empty / error / offline / disabled / success を画面別に定義する。
3. コンポーネント仕様: WordInput、CalendarCell、ColorChoice、ReplyButton、ErrorBanner の target size と state variant を定義する。
4. 画面遷移図: `今日の記録` と `この日の記録`、カレンダー日付選択、保存後遷移の関係を明確にする。
5. アクセシビリティチェックリスト: 48px target、色名併記、コントラスト、読み上げ名、focus順、文字サイズ拡大を含める。
