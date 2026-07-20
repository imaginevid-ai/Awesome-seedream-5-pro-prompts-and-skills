# workflows/
> L2 | 父级: ../AGENTS.md

成员清单
auto-close-stale-issues.yml: 定时清理长期无活动且未被保留标签保护的社区 Issue，并对 GitHub API 瞬时故障执行有限重试。
sync-approved-to-data.yml: 将已审核投稿归一化进本地数据并重新生成全部语言 README。
sync-labels.yml: 把 labels.yml 的审核词汇同步到 GitHub 仓库。
update-readme.yml: 在数据、脚本或视觉资产变化后验证并再生成仓库展示面。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
