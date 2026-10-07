"use client";

import Image from "next/image";
import { useRef } from "react";
import type { WorkspaceProject } from "@/data/workspace";
import { identity } from "@/data/profile";
import { L, t } from "@/lib/i18n";
import { playUISound } from "@/components/workspace/UISound";
import "./labstock.css";
import { navigateToSection } from "@/lib/section-navigation";

type Props = { project: WorkspaceProject; openImage: (index: number, trigger: HTMLElement) => void };

/** A product-led case study. Diagram marks are explanatory, never simulated application records. */
export function LabStockCaseStudy({ project, openImage }: Props) {
  const flowRef = useRef<HTMLOListElement>(null);
  const presentation = project.presentation;
  if (!presentation) return null;
  const gallery = project.gallery ?? [];
  const [today, request, phone, report] = gallery;

  function traceFlow() {
    playUISound("tap");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flowRef.current?.querySelectorAll(":scope > li").forEach((step, index) => {
      const mark = step.querySelector(".ls-node-mark");
      mark?.getAnimations().forEach(animation => animation.cancel());
      mark?.animate([{ opacity: .25 }, { opacity: 1, offset: .3 }, { opacity: .25 }], {
        duration: 700, delay: index * 280, easing: "cubic-bezier(.2,.8,.2,1)",
      });
      const line = step.querySelector(".ls-connector-progress");
      line?.getAnimations().forEach(animation => animation.cancel());
      line?.animate([{ scale: "0 1", opacity: 1 }, { scale: "1 1", opacity: 1 }], {
        duration: 360, delay: index * 280 + 160, easing: "cubic-bezier(.2,.8,.2,1)",
      });
    });
  }

  function screen(src: string, caption: string, index: number, className = "", width = 1440, height = 1024) {
    return <a href={index === 0 ? project.image : gallery[index - 1]?.src} className={`ls-screen ${className}`} onClick={event => { event.preventDefault(); openImage(index, event.currentTarget); }} aria-label={`Quick Look: ${caption}`}>
      <Image src={src} alt={caption} width={width} height={height} sizes="(max-width: 760px) 100vw, 1080px" />
      <span className="ls-expand" aria-hidden="true">↗</span>
    </a>;
  }
  const decisionHeads = [L("Keep the source attached.", "Pertahankan sumbernya."), L("Import twice. Post once.", "Impor dua kali. Catat sekali."), L("Correct without erasing.", "Koreksi tanpa menghapus.")];

  return <article className="ls-study" aria-labelledby="ls-title">
    <header className="ls-opener" id="ls-opening">
      <div className="ls-opener-top"><p>{t(presentation.category)} <span> / {project.year}</span></p><span>{project.status}</span></div>
      <div className="ls-identity"><h1 id="ls-title">{project.title}</h1><p>{t(presentation.headline)}</p></div>
      <figure className="ls-hero">
        <a href={today.src} onClick={event => { event.preventDefault(); openImage(1, event.currentTarget); }} aria-label={`Quick Look: ${today.caption}`}>
          <Image src={presentation.hero.src} alt={t(presentation.hero.caption)} width={1600} height={1000} sizes="(max-width: 760px) 100vw, 1120px" preload />
          <span className="ls-hero-open" aria-hidden="true">↗</span>
        </a>
        <figcaption><span>{L("Desktop overview. Mobile entry.", "Ringkasan desktop. Pencatatan mobile.")}</span><span>{L("Real product · Demo data", "Produk nyata · Data demo")}</span></figcaption>
      </figure>
      <dl className="ls-meta"><div><dt>{L("Designed & built by", "Dirancang & dibangun oleh")}</dt><dd>{identity.name}</dd></div><div><dt>{L("My role", "Peran saya")}</dt><dd>{project.role}</dd></div><div><dt>{L("Built with", "Dibangun dengan")}</dt><dd>{project.stack.join(" · ")}</dd></div></dl>
    </header>

    <section className="ls-context" id="ls-problem">
      <div className="ls-margin-label"><span>01</span>{L("The brief", "Tantangan")}</div>
      <div className="ls-context-body"><h2>{L("The balance is only", "Saldo hanyalah")}<br /><em>{L("half the story.", "separuh cerita.")}</em></h2><div className="ls-context-columns"><div><h3>{L("The problem", "Permasalahan")}</h3><p>{project.problem}</p></div><div><h3>{L("What I built", "Yang saya bangun")}</h3><p>{project.solution}</p></div></div></div>
    </section>

    <section className="ls-system" id="ls-system">
      <header className="ls-section-heading"><div><p className="ls-eyebrow">02 / {L("System design", "Desain sistem")}</p><h2>{L("One ledger.", "Satu ledger.")}<br /><em>{L("Every view connected.", "Semua tampilan terhubung.")}</em></h2></div><div className="ls-system-intro"><p>{project.howItWorks[3]}</p><button className="ls-trace-button" type="button" onClick={traceFlow}>{L("Trace the flow", "Telusuri alur")} <span aria-hidden="true">↗</span></button></div></header>
      <div className="ls-blueprint">
        <div className="ls-blueprint-caption"><span>{L("Data lineage", "Asal-usul data")}</span><span>{L("Source → record → output", "Sumber → catatan → keluaran")}</span></div>
        <ol className="ls-flow" ref={flowRef}>
          {presentation.flow.map((step, index) => <li className={`ls-node ls-node-${index}`} key={step.title}>
            <div className="ls-node-label"><span>{String(index + 1).padStart(2, "0")}</span><h3>{t(step.title)}</h3><i className="ls-node-mark" aria-hidden="true" /></div>
            <div className="ls-node-body">
              {index === 0 && <div className="ls-paper-symbol" aria-hidden="true"><span /><span /><span /></div>}
              {index === 3 && <div className="ls-output-symbol" aria-hidden="true"><span /><span /><span /><span /></div>}
              <ul>{step.items.map(item => <li key={item}>{index === 1 && <span className="ls-check" aria-hidden="true">✓</span>}{t(item)}</li>)}</ul>
            </div>
            {index < 3 && <span className="ls-connector" aria-hidden="true"><i className="ls-connector-progress" />→</span>}
          </li>)}
        </ol>
        <div className="ls-branches">{presentation.decisions.slice(1).map((item, index) => <div key={item.title}><span className="ls-branch-symbol" aria-hidden="true">{index === 0 ? "↳" : "↶"}</span><div><h3>{t(item.title)}</h3><p>{t(item.detail)}</p></div></div>)}</div>
      </div>
    </section>

    <section className="ls-engineering" id="ls-decisions">
      <header><p className="ls-eyebrow">03 / {L("Engineering decisions", "Keputusan rekayasa")}</p><h2>{L("Designed for", "Dirancang untuk")}<br /><em>{L("the second import.", "impor berikutnya.")}</em></h2></header>
      <ol className="ls-decisions">{presentation.decisions.map((item, index) => <li key={item.title}>
        <span className="ls-decision-number" aria-hidden="true">0{index + 1}</span><div><h3>{decisionHeads[index]}</h3><p>{t(item.detail)}</p><small>{t(item.title)}</small></div>
      </li>)}</ol>
    </section>

    <section className="ls-product" id="ls-product">
      <header className="ls-section-heading"><div><p className="ls-eyebrow">04 / {L("Inside the product", "Di dalam produk")}</p><h2>{L("From daily work", "Dari pekerjaan harian")}<br /><em>{L("to the final workbook.", "hingga workbook akhir.")}</em></h2></div><p className="ls-product-note">{L("A closer look at the software. Every screen below uses synthetic demo data.", "Melihat perangkat lunaknya lebih dekat. Setiap layar menggunakan data demo sintetis.")}</p></header>
      <article className="ls-scene ls-scene-today" id="ls-today">
        <div className="ls-scene-copy"><span className="ls-scene-number">01 / {L("Daily overview", "Ringkasan harian")}</span><h3>{t(presentation.walkthrough[0].title)}</h3><p>{t(presentation.walkthrough[0].detail)}</p><a href="#ls-stock" onClick={navigateToSection}>{L("Inspect the stock view", "Lihat tampilan stok")} ↓</a></div>
        <figure className="ls-product-plate">{screen("/projects/labstock/today-detail.webp", today.caption, 1, "", 1136, 888)}<figcaption>{L("Hari Ini · content detail", "Hari Ini · detail konten")}<span>{L("Full screen in Quick Look ↗", "Layar lengkap di Quick Look ↗")}</span></figcaption></figure>
      </article>
      <article className="ls-scene ls-scene-request" id="ls-request">
        <header className="ls-scene-copy"><span className="ls-scene-number">02 / {L("Requisition", "Amprah")}</span><h3>{t(presentation.walkthrough[1].title)}</h3><p>{t(presentation.walkthrough[1].detail)}</p></header>
        <div className="ls-request-media"><figure className="ls-request-desktop">{screen("/projects/labstock/request-detail.webp", request.caption, 2, "", 1136, 704)}<figcaption>{L("Desktop · one requisition, multiple items", "Desktop · satu amprah, beberapa barang")}</figcaption></figure><figure className="ls-request-phone">{screen("/projects/labstock/phone-detail.webp", phone.caption, 3, "", 390, 844)}<figcaption>{L("Mobile detail · full screen in Quick Look ↗", "Detail mobile · layar lengkap di Quick Look ↗")}</figcaption></figure></div>
      </article>
      <article className="ls-scene ls-scene-report" id="ls-report">
        <div className="ls-report-heading"><span className="ls-scene-number">03 / {L("Reporting", "Pelaporan")}</span><h3>{t(presentation.walkthrough[2].title)}</h3><p>{t(presentation.walkthrough[2].detail)}</p></div>
        <figure>{screen("/projects/labstock/report-detail.webp", report.caption, 4, "", 1136, 920)}<figcaption><span>{L("Laporan · monthly report", "Laporan · laporan bulanan")}</span><span>{L("Corrections, closing balance and Excel output", "Koreksi, saldo akhir, dan keluaran Excel")}</span></figcaption></figure>
      </article>
      <div className="ls-stock-strip" id="ls-stock"><div><span className="ls-scene-number">{L("Supporting view", "Tampilan pendukung")}</span><h3>{L("The stock behind the work.", "Stok di balik pekerjaan.")}</h3><p>{t(presentation.stockCaption)}</p></div>{project.image && screen(project.image, t(presentation.stockCaption), 0)}</div>
    </section>

    <section className="ls-evidence-section" id="ls-evidence"><div className="ls-margin-label"><span>05</span>{L("Evidence", "Bukti")}</div><div><h2>{L("A product you can inspect.", "Produk yang bisa diperiksa.")}</h2><p className="ls-evidence-intro">{L("The public record, and where to look.", "Catatan publik, dan tempat memeriksanya.")}</p><dl className="ls-evidence">{project.evidence.map((item, index) => <div key={item.label}><dt><span aria-hidden="true">0{index + 1}</span>{item.label}</dt><dd>{item.value}</dd><a onClick={navigateToSection} href={index === 3 ? "#ls-report" : index === 0 ? "#ls-system" : "#ls-decisions"}>{index === 3 ? L("View report", "Lihat laporan") : index === 0 ? L("View system", "Lihat sistem") : L("View decision", "Lihat keputusan")} ↗</a></div>)}</dl><p className="ls-evidence-limit">{L("Screens show the interface. They are not an independent test of import safety or correction logic.", "Layar menunjukkan antarmuka, bukan pengujian independen keamanan impor atau logika koreksi.")}</p></div></section>
    <section className="ls-takeaway" id="ls-demonstrates"><p className="ls-eyebrow">{L("What this demonstrates", "Yang ditunjukkan proyek ini")}</p><h2>{L("The interface is the visible part.", "Antarmuka adalah bagian yang terlihat.")}<br /><em>{L("The record is what holds it together.", "Catatanlah yang menyatukannya.")}</em></h2><p>{project.whyItMatters}</p></section>
    <aside className="ls-boundary" id="ls-boundary"><h2>{L("About the evidence", "Tentang bukti")}</h2><div><p>{project.publicLimitations}</p><p>{t(project.assetNote ?? "")}</p></div></aside>
  </article>;
}
