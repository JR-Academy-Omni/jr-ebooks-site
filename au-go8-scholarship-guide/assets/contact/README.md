# 联系方式资产

电子书的 sales 触点分两档，按书的 CTA 选，可叠用（封底横条 + 内页名片）：

| 档位 | 组件 | 用什么场景 |
|------|------|-----------|
| 轻量社群触点 | `.contact-bar`（二维码 + 文案横条） | 进群 / 领资料 / 关注更新 —— 泛流量书（盘点、手册） |
| 人格化 sales 触点 | `.sales-card`（整幅顾问横版名片） | 课程咨询 / 求职规划 / 转码 —— 高意向转化书，名片自带头像 + 战绩 + 个人微信码 |

## 资产清单

| 文件 | 是什么 |
|------|--------|
| `qr-xiaohua.png` | 官方小助手微信码（contact-bar 默认），源：web-zh GetInTouch 同款 |
| `qr-amelia.png` / `qr-angela.png` / `qr-beta.png` / `qr-rain.png` | 顾问个人微信码（contact-bar 定向引流用） |
| `sales-cards/amelia.jpg` | Amelia · IT Career Consultant 横版名片（含个人码） |
| `sales-cards/angela.jpg` | Angela · IT Career Consultant 横版名片（含个人码） |
| `sales-cards/rain.jpg` | Rain · Senior IT Career Consultant 横版名片（含个人码） |

每本书在 `meta.json` 的 `contact` 字段登记用了谁：`{ "qr": "qr-xiaohua.png", "salesCard": "rain.jpg" }`。

## 用法

```html
<!-- 内容页尾 / 封底前：整幅名片 -->
<p class="sales-card-lead">想聊聊自己的转码路线？扫名片上的码，免费简历诊断：</p>
<div class="sales-card"><img src="../../assets/contact/sales-cards/rain.jpg" alt="Rain · Senior IT Career Consultant" /></div>
```

🚨 二维码和名片只能用本目录的官方资产（源头：web-zh `public/image/qrcode/` + sales 设计稿），**禁止自己生成二维码**（生成的码指错地方 = 流量送丢）。名片有更新时整张替换，不在 HTML 里拼接伪造。
