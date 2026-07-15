# AI Engineer 自评打分器

## 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| Domain | Select | RAG, Agent, Eval, LLMOps, Safety, Product |
| Question | Text | 自测题 |
| Score | Number | 0, 1, 2 |
| Evidence | Text | README, trace, eval report, screenshot, code path |
| Next Action | Text | 下一步补什么 |
| Done | Checkbox | 是否补完 |

## Sheet 公式

总分：

```text
=SUM(F2:F25)
```

等级：

```text
=IFS(SUM(F2:F25)<=15,"L0 工具体验层",SUM(F2:F25)<=27,"L1 demo 层",SUM(F2:F25)<=39,"L2 可投 AI 相关软件/数据岗",SUM(F2:F25)<=48,"L3 可冲 AI Engineer")
```

## 30 天补强路径

| Level | 未来 30 天先补 3 件事 |
| --- | --- |
| L0 | 跑通客服工单 Agent；写 10 题 golden set；部署一个可访问 demo。 |
| L1 | 补 20 条 failure case；加 trace；把 README 写成可复现项目。 |
| L2 | 按 3 条目标 JD 改简历；准备 5 道完整面试答案；做一次成本和延迟分析。 |
| L3 | 补系统设计图；准备 trade-off；把项目数据、限制、下一步写清楚。 |
