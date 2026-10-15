# MYV score editor for Gemini CLI · 樂譜編輯器 Gemini CLI 擴充

Let **Gemini CLI** write and edit sheet music **live** in the [MYV score editor](https://myv.tomwang221812.com/tools/score/) (a free web app by 流藝巨嗓藝術工作室 MYV · Mind Your Voice Art Studio). You keep the editor open in your browser; Gemini reads the score, adds notes, lyrics, chords, dynamics, articulations, and you see every change at once (each one is a single undo step).

讓 **Gemini CLI** 直接在你打開著的[樂譜編輯器](https://myv.tomwang221812.com/tools/score/)裡即時寫譜、改譜、填歌詞、加和弦與力度。每次修改都馬上顯示，也都能復原。

## Install · 安裝

```
gemini extensions install https://github.com/tomwang221812/gemini-myv-score-editor
```

When asked for **Score editor link**, paste your link: open the editor (you must be signed in; members only), press **AI**, copy the link. Change it later with `gemini extensions config myv-score-editor`.
安裝時會問「Score editor link」：在編輯器按 **AI** → 複製連結貼上（會員專用，需要登入）。

Needs Node.js 18+ (Gemini CLI already requires it). 需要 Node.js 18 以上。

## Use · 使用

1. Keep the score editor open in a browser tab. 編輯器要開著。
2. In Gemini CLI: *"Write Happy Birthday in C major, 3/4, with chords and lyrics"* / 「幫我寫小蜜蜂，第一小節要呼吸，第三小節漸強」.
3. The first change asks for your permission: the editor shows a 6-digit code with **Allow / Refuse**. Tap Allow if the code matches the one Gemini shows. 第一次動作時編輯器會顯示 6 位數代碼，代碼相同才按「允許」。

Step-by-step guide for every AI app: https://myv.tomwang221812.com/tools/score/ai-guide/

## Safety · 安全

- The link is **your secret**. Anyone holding it can *ask* to edit your open score, but nothing happens until you tap Allow in your editor. Press **Renew link** in the editor to kill an old link at once.
- The AI can only use ten fixed tools on the one score that is open in your editor. It cannot see your other files or your account.
- This extension is a small program (`bridge.mjs`, no dependencies) that forwards Gemini's messages to your link over HTTPS. Nothing else leaves your computer.

MIT License.
