<div align="center">
  <img src="https://raw.githubusercontent.com/k-usk/Project-Neural-Archive/main/public/favicon.svg" width="120" alt="Neural Archive Logo" />
  <h1>Project Neural Archive</h1>
  <p><strong>高密度かつ専門的な人工知能（AI）ナレッジベース</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Created with AI](https://img.shields.io/badge/Created_with-AI-purple.svg?logo=openai)](https://github.com/features/copilot)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?logo=javascript&logoColor=black)]()

</div>

---

## 📖 プロジェクトについて

**Project Neural Archive** は、人工知能（AI）の歴史、技術、哲学、および重要人物について網羅的に構築された、Wikipediaスタイルのローカル・ナレッジベースです。

本アーカイブの最大の目的は、初期の理論的基盤から最新のディープラーニング手法、そしてAGI（汎用人工知能）に至るまでのAIの進化を体系的に記録することです。記述は感情的なハイプを排し、**中立性、学術的正確性、および客観的な技術史**に基づくことを厳格なルールとしています。

### 🤖 AIによるコンテンツ生成と管理

このシステムにおける最大の特徴は、コンテンツの構築自体にAIエージェントの力を全面的に活用している点です。

- **コンテンツの執筆:** すべての記事は、あらかじめ定義された「AIエクスパート・ペルソナ」を持つ生成AIによって初稿が作成され、網羅的に記述されています。
- **継続的な品質管理（中立化）:** AI自身が定期的に記事をレビューし、主観的・装飾的な表現を削ぎ落とし、学術的で洗練されたトーン・アンド・マナーを維持します。
- **再帰的なリンク構造:** 単語と単語の関連性をAIが解析し、Markdown上でシームレスな相互リンク（`[概念](#/概念)`）を自律的に構築することで、知識が連鎖する循環構造を実現しています。

---

## 🏛️ 収録されている知識領域

本アーカイブは、以下の3つの主要なディレクトリカテゴリで明確に分類されています。

### 📜 歴史 (`history/`)
AIの軌跡を形作った基盤となる出来事とパラダイムシフト。
- **代表記事**: ダートマス会議、エキスパートシステム、第1次〜第2次AIの冬、ILSVRC（ImageNetの衝撃）など。

### 🧠 技術 (`tech/`)
AIシステムを駆動するアルゴリズムやアーキテクチャの客観的な深い解説。
- **代表記事**: パーセプトロン、ニューラルネットワーク、深層学習（ディープラーニング）、トランスフォーマー、大型言語モデル（LLM）、AGIなど。

### 👤 人物 (`people/`)
AIの歴史を切り拓いた数学者、計算機科学者、理論家たちの真実の功績。
- **代表記事**: アラン・チューリング、エイダ・ラブレス、クロード・シャノン、ジェフリー・ヒントンなど。

---

## 🚀 ローカルでの実行手順

リポジトリをクローンし、快適なWikiインターフェースをローカル環境で起動・閲覧することができます。

```bash
# 1. リポジトリのクローン
git clone https://github.com/k-usk/Project-Neural-Archive.git

# 2. ディレクトリへの移動
cd Project-Neural-Archive

# 3. 依存関係のインストール
npm install

# 4. 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセスすることで、アーカイブを閲覧できます。

---

## 🛠️ 技術スタック

- **コアフレームワーク:** Vite + Vanilla JavaScript / CSS
- **コンテンツパーサー:** 依存関係を最小限に抑え、`.md` ファイル群を動的にパースしてHTMLとして描画。
- **ルーティング:** Vanilla JSによる独自のクライアントサイドルーティング。画面遷移を伴わず、シームレスで高速な記事の読み込みを実現しています。

## 📝 コンテンツ執筆ガイドライン

AIエージェント、および本アーカイブの編集者は、以下のルールに従って記事を作成・修正します。
1. **客観性と事実ベース:** 過度な期待や感情的な表現（ハイプ）を排除する。技術が実際にできること、証明されている限界、歴史的事実のみにフォーカスする。
2. **ディープリンクの徹底:** コンセプトは必ず他の関連記事へのリンクを持つこと。孤立した記事を作らない。
3. **構造化されたフォーマット:** 各記事には明確な定義、歴史的背景、コアとなる仕組み、そして関連項目が含まれていなければならない。

---

## 📄 ライセンス

本プロジェクトは MIT License のもとで公開されています。詳細については [LICENSE](LICENSE) ファイルをご参照ください。

<div align="center">
  <i>"機械が思考できるかという問いは、潜水艦が泳げるかという問いと同じくらい意味がない。" — エドガー・W・ダイクストラ</i>
</div>
