import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { countAuditLogs } from "@/lib/repositories/audit";
import { listItems } from "@/lib/repositories/love-items";
import { countMessages } from "@/lib/repositories/messages";
import { listPhotos } from "@/lib/repositories/photos";
import { listPosts } from "@/lib/repositories/posts";
import { listBlocks } from "@/lib/repositories/ip-blocks";

export const runtime = "nodejs";

export default function AdminDashboardPage() {
  const posts = listPosts().length;
  const messages = countMessages();
  const photos = listPhotos().length;
  const loveItems = listItems().length;
  const blocks = listBlocks().length;
  const audits = countAuditLogs();

  const stats = [
    { num: posts, label: "点点滴滴", href: "/admin/posts", hint: "朋友圈动态" },
    { num: messages, label: "留言", href: "/admin/messages", hint: "访客祝福" },
    { num: photos, label: "相册", href: "/admin/photos", hint: "恋爱照片" },
    {
      num: loveItems,
      label: "恋爱清单",
      href: "/admin/love-list",
      hint: "约定事项",
    },
    { num: blocks, label: "IP 封禁", href: "/admin/security", hint: "安全策略" },
    { num: audits, label: "审计日志", href: "/admin/audit", hint: "操作记录" },
  ];

  return (
    <>
      <PageHeader
        title="仪表盘"
        description="站点内容一览与常用入口"
        actions={
          <Link className="admin-btn" href="/admin/posts/new">
            发表动态
          </Link>
        }
      />

      <div className="admin-stats">
        {stats.map((s) => (
          <div className="admin-stat" key={s.label}>
            <Link href={s.href}>
              <div className="num">{s.num}</div>
              <div className="label">{s.label}</div>
              <div className="hint">{s.hint}</div>
            </Link>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h3>快捷入口</h3>
        <div className="admin-quick-grid">
          <Link className="admin-quick-link" href="/admin/posts/new">
            <strong>发表动态</strong>
            <span>分享文字与图片</span>
          </Link>
          <Link className="admin-quick-link" href="/admin/messages">
            <strong>管理留言</strong>
            <span>审核与删除访客留言</span>
          </Link>
          <Link className="admin-quick-link" href="/admin/photos">
            <strong>管理相册</strong>
            <span>上传与整理照片</span>
          </Link>
          <Link className="admin-quick-link" href="/admin/love-list">
            <strong>恋爱清单</strong>
            <span>更新约定进度</span>
          </Link>
          <Link className="admin-quick-link" href="/admin/settings">
            <strong>站点设置</strong>
            <span>标题、情侣与功能开关</span>
          </Link>
          <Link className="admin-quick-link" href="/" target="_blank">
            <strong>查看前台</strong>
            <span>新窗口打开站点首页</span>
          </Link>
        </div>
      </div>
    </>
  );
}
