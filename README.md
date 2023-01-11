# amazonjp2csv

- amazon の購入履歴を csv（または json）でダウンロード
- 年ごとの生成で、最初に指定

## 使い方

### コピペして使う場合

1. [ブラウザの開発者ツールのコンソールを開く](https://www.google.com/search?q=%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6+%E9%96%8B%E7%99%BA%E8%80%85%E3%83%84%E3%83%BC%E3%83%AB+%E3%82%B3%E3%83%B3%E3%82%BD%E3%83%BC%E3%83%AB)
2. `run.js` の中身をコピペして Enter

### bookmarklet で使う場合

[設定方法](https://www.google.com/search?q=bookmarklet+%E7%99%BB%E9%8C%B2%E6%96%B9%E6%B3%95)

```
javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://cdn.jsdelivr.net/gh/geerpm/amazonjp2csv@main/run.js')
```

## 開発

- 修正して console に貼り付けて実行
- ループを外して 1 ページめのみで確認

## 利用について

- 私的利用・複製・改変は自由。商用利用不可。利用に関しては自己責任で
