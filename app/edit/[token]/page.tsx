"use client";

import { useEffect, useState } from "react";

// Backend API base — set NEXT_PUBLIC_API_URL in Vercel env (must be https to
// avoid mixed-content). e.g. https://api.example.com
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9101";

type Post = {
  ok: boolean;
  token: string;
  platform: string;
  title: string;
  body: string;
  status: string;
  meta: { date?: string; id?: string };
  placeholders: string[];
  error?: string;
};

export default function EditPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [loadErr, setLoadErr] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState<string>("");
  const [status, setStatus] = useState<React.ReactNode>("");
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState<string>("");

  useEffect(() => {
    fetch(`${API}/api/post/${token}`)
      .then((r) => r.json())
      .then((j: Post) => {
        if (!j.ok) {
          setLoadErr(j.error === "not_found" ? "Пост не найден или уже опубликован." : (j.error || "Ошибка загрузки"));
          return;
        }
        setPost(j);
        setBody(j.body);
        if (j.status === "published") setDone("already");
      })
      .catch(() => setLoadErr("Не удалось связаться с сервером."));
  }, [token]);

  function applyPlaceholders() {
    let t = body;
    for (const ph of post?.placeholders || []) {
      const v = (values[ph] || "").trim();
      if (v) t = t.split(`[${ph}]`).join(v);
    }
    setBody(t);
    setStatus("плейсхолдеры подставлены");
  }

  async function publish() {
    const left = body.match(/\[[^\]\n]{1,60}\]/g) || [];
    if (left.length) {
      if (!confirm(`В тексте остались плейсхолдеры: ${left.join(", ")}. Всё равно опубликовать?`)) return;
    }
    setPublishing(true);
    setStatus("публикую…");
    try {
      const r = await fetch(`${API}/publish/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      const j = await r.json();
      if (j.ok) {
        setDone(j.url || "ok");
        setStatus(<span className="ok">опубликовано ✓</span>);
      } else {
        setStatus(<span className="err">ошибка: {j.error}</span>);
        setPublishing(false);
      }
    } catch {
      setStatus(<span className="err">сеть недоступна</span>);
      setPublishing(false);
    }
  }

  if (loadErr) return <div className="center">{loadErr}</div>;
  if (done === "already") return <div className="center">Этот пост уже опубликован ✓</div>;
  if (done) {
    return (
      <div className="center">
        <div>
          Опубликовано ✓<br />
          {done.startsWith("http") ? <a href={done} target="_blank" rel="noopener">Открыть пост ↗</a> : null}
        </div>
      </div>
    );
  }
  if (!post) return <div className="center">Загрузка…</div>;

  return (
    <div className="wrap">
      <h1 className="h1">{post.title}</h1>
      <div className="meta">
        Площадка: {post.platform} · дата по плану: {post.meta?.date || "—"}
      </div>

      <div className="card">
        <h2>Заполнить плейсхолдеры</h2>
        {post.placeholders.length ? (
          <>
            <p className="hint">Впиши реальные значения, затем «Подставить» — они встанут в текст.</p>
            {post.placeholders.map((ph) => (
              <div className="phrow" key={ph}>
                <span className="phlabel">[{ph}]</span>
                <input
                  className="val"
                  placeholder="реальное значение"
                  value={values[ph] || ""}
                  onChange={(e) => setValues({ ...values, [ph]: e.target.value })}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="muted">плейсхолдеров нет</div>
        )}
      </div>

      <div className="card">
        <h2>Текст поста (можно править всё)</h2>
        <p className="hint">Правь свободно. Плейсхолдеры в тексте — в квадратных скобках.</p>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="bar">
        <div className="bar-in">
          <button className="apply" onClick={applyPlaceholders} disabled={!post.placeholders.length}>
            Подставить плейсхолдеры
          </button>
          <button className="pub" onClick={publish} disabled={publishing}>
            ✅ Готово и опубликовать
          </button>
          <span className="status">{status}</span>
        </div>
      </div>
    </div>
  );
}
