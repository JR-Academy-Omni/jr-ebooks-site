# 联系方式资产

电子书的 sales 触点分两档，固定按“一头一尾”使用：

| 档位 | 组件 | 用什么场景 |
|------|------|-----------|
| 轻量社群触点 | `.contact-bar`（二维码 + 文案横条） | 进群 / 领资料 / 关注更新 —— 泛流量书（盘点、手册） |
| 人格化 sales 触点 | `.sales-card`（整幅顾问横版名片） | 课程咨询 / 求职规划 / 转码 —— 高意向转化书，名片自带头像 + 战绩 + 个人微信码 |

## 资产清单

| 文件 | 是什么 |
|------|--------|
| `qr-amelia.png` / `qr-angela.png` / `qr-rain.png` | **三位顾问个人微信码 —— `.contact-bar` 二维码只能用这三个之一**。按书的 `salesCards` 第一位选对应的人。 |
| `qr-beta.png` | Beta 个人微信码（备用，当前书目未启用）。 |

> 🚨 **`.contact-bar` 二维码禁止用「小助手」码（原 `qr-xiaohua.png` 已删除）**。小助手 `u.wechat.com` 个人分享短链会过期 / 扫不到，且要求微信码统一来自三位顾问（Amelia / Angela / Rain）。新书一律从上面三个里选。
| `sales-cards/amelia.jpg` | Amelia · IT Career Consultant 横版名片（含个人码） |
| `sales-cards/amelia-huiguoya.png` | **回国鸭电子书专用 Amelia 尾页卡片**：已移除匠人学院 Logo，并嵌入透明回国鸭横版 Logo；所有回国鸭电子书必须直接调用这张成品，不得再用 `amelia.jpg` 临时遮盖或叠图。 |
| `sales-cards/angela.jpg` | Angela · IT Career Consultant 横版名片（含个人码） |
| `sales-cards/rain.jpg` | Rain · Senior IT Career Consultant 横版名片（含个人码） |

每本书在 `meta.json` 的 `contact` 字段登记用了谁：`{ "qr": "qr-rain.png", "salesCard": "rain.jpg" }`（`qr` 三选一：amelia / angela / rain）。

## 用法

```html
<!-- 全书最后一页：整幅名片，只出现一次 -->
<p class="sales-card-lead">想聊聊自己的转码路线？扫名片上的码，免费简历诊断：</p>
<div class="sales-card"><img src="../../assets/contact/sales-cards/rain.jpg" alt="Rain · Senior IT Career Consultant" /></div>
```

🚨 二维码和名片只能用本目录的官方资产（源头：web-zh `public/image/qrcode/` + sales 设计稿），**禁止自己生成二维码**（生成的码指错地方 = 流量送丢）。轻量二维码横条只在第 2 页出现一次；完整名片只在最后一页出现一次。名片有更新时整张替换，不在 HTML 里拼接伪造；必须保持原始宽高比，禁止压缩变形。

回国鸭电子书例外采用已经归档完成的 `sales-cards/amelia-huiguoya.png`。该文件是唯一允许的回国鸭 Amelia 尾页卡片，禁止调用带匠人学院 Logo 的 `amelia.jpg`，也禁止在 HTML / CSS 中现场覆盖、遮挡或重复叠加 Logo。
