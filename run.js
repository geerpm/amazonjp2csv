// await (async () => {
(async () => {
  const NUM_PER_PAGE = 10;
  const URL_BASE = "https://www.amazon.co.jp";
  const URL_FORMAT = `${URL_BASE}/gp/css/order-history?disableCsd=no-js&orderFilter=year-{year}&startIndex={startIndex}`;
  const DATA_ORDER_FORMAT = {
    id: "",
    orderAt: "",
    total: "",
    url: "",
    params: [],
    items: [],
  };
  const DATA_ITEM_FORMAT = {
    url: "",
    title: "",
    type: "",
    params: [],
  };
  const CSV_HEAD_COLS = {
    id: "ID",
    orderAt: "注文日時",
    total: "金額",
    url: "注文URL",
    item1Type: "Item1 種別",
    item1Name: "Item1 名前",
    item1Url: "Item1 URL",
    items: "All Items",
  };
  try {
    const input = window.prompt("対象の年" + "\n" + '例: "2021", "2020json", "1999csv"', new Date().getFullYear());
    const parsedInputs = input.match(/([1-9][0-9]{3})(csv|json)?/);
    if (!parsedInputs || !parsedInputs[1]) {
      return alert("入力が間違っています");
    }
    const year = parsedInputs[1];
    const format = parsedInputs[2] ?? "csv";

    console.log(`.. Process ${year}, ${format}`);
    await main(year, format);
  } catch (e) {
    return alert("取得に失敗しました");
  }

  /**
   * @param number year
   * @param string format
   * @returns
   */
  async function main(year, format) {
    let result = [];

    for (let i = 0; ; i += NUM_PER_PAGE) {
      console.log(`.. Start i: ${i}-`);

      const url = URL_FORMAT.replace(/{year}/, `${year}`).replace(/{startIndex}/, i);
      const response = await fetch(url);
      const responseText = await response.text();
      const doc = new DOMParser().parseFromString(responseText, "text/html");

      const data = parseData(doc);
      if (data.length <= 0) {
        console.log(`.. Finished ${result.length} lines`);
        break;
      }

      result = [...result, ...data];

      // sleep
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log(`.. End i: ${i}-`);
    }

    const [fileExt, fileContent] = toStringData(result, format);
    downloadFile(fileContent, `amazon-${year}.${fileExt}`);
  }

  /**
   * @param Document doc
   * @returns DATA_ORDER_FORMAT
   */
  function parseData(doc) {
    const ordersEl = [...doc.querySelectorAll(".order")];
    if (ordersEl.length <= 0) {
      return [];
    }

    return ordersEl.map((orderEl) => {
      const orderInfo = JSON.parse(JSON.stringify(DATA_ORDER_FORMAT));

      [...orderEl.querySelectorAll(".order-info .label")].forEach((labelEl) => {
        let p = labelEl,
          v;
        do {
          p = p.parentNode;
          v = p.querySelector(".value");
        } while (p && p.tagName !== "BODY" && !v);

        const label = labelEl.innerText.trim();
        const value = v.innerText.trim();

        if (p.classList.contains("yohtmlc-order-id")) {
          orderInfo.id = value;
        } else if (p.classList.contains("yohtmlc-order-total")) {
          orderInfo.total = value.replaceAll(/[^0-9\.]/g, "");
          orderInfo.params.push({ label: "totalOrig", value });
        } else if (label === "注文日") {
          orderInfo.orderAt = value;
        } else {
          orderInfo.params.push({ label, value });
        }
      });

      const orderLink = orderEl.querySelector(".yohtmlc-order-details-link");
      orderInfo.url = orderLink ? URL_BASE + orderLink.getAttribute("href") : "";

      orderInfo.items = [...orderEl.querySelectorAll(".yohtmlc-item")].map((itemEl) => {
        const item = JSON.parse(JSON.stringify(DATA_ITEM_FORMAT));
        itemEl.querySelectorAll("*").forEach((el) => {
          if (el.tagName === "A" && el.getAttribute("href").startsWith("/gp/product/")) {
            item.url = URL_BASE + el.getAttribute("href");
            item.title = el.innerText.trim();
          } else if (el.innerText.includes("Kindle 版")) {
            item.type = "kindle";
          }
        });
        return item;
      });

      // console.log( {  orderInfo });
      return orderInfo;
    });
  }

  /**
   * @param object data as DATA_ORDER_FORMAT
   * @param string format
   * @returns [fileExt, fileContentString]
   */
  function toStringData(data, format) {
    switch (format) {
      case "csv":
        const heads = Object.values(CSV_HEAD_COLS).join(",");
        const contents = data
          .map((row) => {
            return [
              row.id,
              row.orderAt,
              row.total,
              row.url,
              row.items.length > 0 ? row.items[0].type : "",
              row.items.length > 0 ? row.items[0].title : "",
              row.items.length > 0 ? row.items[0].url : "",
              JSON.stringify(row.items),
            ]
              .map((v) => `"${v.replaceAll('"', '""')}"`)
              .join(",");
          })
          .join("\n");
        return ["csv", heads + "\n" + contents];
      case "json":
      default:
        return ["json", JSON.stringify(data, null, 2)];
    }
  }

  /**
   * @param string data
   * @param string fileName
   */
  function downloadFile(data, fileName) {
    const dla = document.createElement("a");
    dla.setAttribute("href", "data:application/octet-stream;charset=utf-8," + encodeURIComponent(data));
    dla.setAttribute("download", fileName);
    dla.style.display = "none";
    document.body.appendChild(dla);
    dla.click();
    document.body.removeChild(dla);
  }
})();
