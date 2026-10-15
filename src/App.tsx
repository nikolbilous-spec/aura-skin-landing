import { FormEvent, useEffect, useRef, useState } from "react";
import { BubbleOrb, CountUp, CursorGlow, SpinBottle } from "./effects";

const serumTexture =
  "https://images.unsplash.com/photo-1748543668687-624e058c367c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1800";
const ingredientTexture =
  "https://images.unsplash.com/photo-1518842013791-b874be246c34?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1800";
const skinTexture =
  "https://images.unsplash.com/photo-1659007747376-3811b34e458f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=88&w=1800";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateScroll = () => {
      rafRef.current = null;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main>
      <CursorGlow />
      <div
        className="scroll-meter"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />

      <section className="hero" id="top">
        <nav className="nav" aria-label="Main navigation">
          <a className="wordmark" href="#top" aria-label="Aura Skin home">
            AURA<span>•</span>SKIN
          </a>
          <div className="nav-links">
            <a href="#sensory">RITUALS</a>
            <a href="#serum">THE SERUM</a>
            <a href="#contact">CART (0)</a>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-kicker mono">
            <span>SKINCARE / REIMAGINED</span>
            <span>01 — 04</span>
          </div>

          <div className="hero-title-wrap">
            <BubbleOrb src={serumTexture} alt="Macro view of luminous skincare serum" />
            <h1>
              <span>UNVEIL</span>
              <span className="outline">YOUR GLOW.</span>
            </h1>
          </div>

          <div className="hero-footer">
            <p className="hero-subtitle">Texture, refined.</p>
            <p className="hero-copy mono">
              HIGH-PERFORMANCE FORMULAS.
              <br />
              SENSORY BY DESIGN.
            </p>
            <a className="primary-cta" href="#serum">
              <span>SHOP THE DROP</span>
              <Arrow />
            </a>
          </div>
        </div>

        <div className="ticker" aria-hidden="true">
          <div>
            <span>FORMULA 01</span>
            <span>CLINICALLY MINDED</span>
            <span>MADE FOR REAL SKIN</span>
            <span>FORMULA 01</span>
            <span>CLINICALLY MINDED</span>
            <span>MADE FOR REAL SKIN</span>
          </div>
        </div>
      </section>

      <section className="sensory" id="sensory">
        <header className="section-intro">
          <span className="eyebrow mono">THE SENSORY INDEX — 01/03</span>
          <p>
            Skincare you can <em>feel</em>
            <br />
            before you see it.
          </p>
        </header>

        <article className="gallery-card texture-card">
          <div className="card-copy">
            <span className="chapter mono">01 / TEXTURE</span>
            <h2>MELTS ON CONTACT.</h2>
            <p>
              A weightless veil that shifts from silken serum to skin-level
              hydration.
            </p>
          </div>
          <figure className="image-frame wide">
            <img src={serumTexture} alt="Translucent serum textures overlapping" />
            <figcaption className="mono">
              VISCOSITY / 28.4 CPS <span>AURA LABS™</span>
            </figcaption>
          </figure>
        </article>

        <article className="gallery-card science-card">
          <figure className="image-frame portrait">
            <img src={ingredientTexture} alt="Amber ingredient bubbles in suspension" />
            <div className="science-overlay">
              <span className="mono">ACTIVE COMPLEX</span>
              <strong>3×</strong>
              <span className="mono">BARRIER SUPPORT</span>
            </div>
          </figure>
          <div className="card-copy science-copy">
            <span className="chapter mono">02 / INGREDIENT SCIENCE</span>
            <h2>SMARTER AT THE SOURCE.</h2>
            <p>
              Bio-fermented peptides, ectoin and a tri-weight hyaluronic complex
              work in precise layers.
            </p>
            <ul className="formula-list mono">
              <li><span>01</span> ECTOIN + PEPTIDES</li>
              <li><span>02</span> TRI-HA COMPLEX</li>
              <li><span>03</span> CERAMIDE NP</li>
            </ul>
          </div>
        </article>

        <article className="gallery-card result-card">
          <div className="result-header">
            <span className="chapter mono">03 / THE RESULT</span>
            <p className="mono">AFTER 28 DAYS OF CONSISTENT USE</p>
          </div>
          <figure className="image-frame result-image">
            <img src={skinTexture} alt="Soft luminous cream texture in close-up" />
            <div className="result-type">
              <span>SKIN,</span>
              <span>AMPLIFIED.</span>
            </div>
          </figure>
          <div className="result-stats">
            <div><CountUp to={94} /><span className="mono">FELT DEEPLY HYDRATED</span></div>
            <div><CountUp to={91} /><span className="mono">SAW SMOOTHER TEXTURE</span></div>
            <p className="mono">CONSUMER STUDY, 86 PARTICIPANTS</p>
          </div>
        </article>
      </section>

      <section className="product-curtain" id="serum">
        <div className="curtain-heading">
          <span className="mono">FORMULA 01 / DAILY</span>
          <h2>THE SERUM</h2>
          <p>30 ML / 1.0 FL OZ</p>
        </div>

        <div className="product-stage">
          <aside className="floating-copy left-copy">
            <span className="mono">WHAT IT DOES</span>
            <p>Floods every layer with lasting, intelligent hydration.</p>
          </aside>

          <SpinBottle />

          <aside className="floating-copy right-copy">
            <span className="mono">HOW IT FEELS</span>
            <p>Cool. Cushioned. Almost impossibly light.</p>
          </aside>
        </div>

        <div className="buy-bar">
          <div>
            <span>THE SERUM</span>
            <span className="mono">HYDRATE + REPAIR / 30 ML</span>
          </div>
          <span className="price">$88</span>
          <button type="button">
            ADD TO RITUAL <Arrow />
          </button>
        </div>
      </section>

      <footer id="contact">
        <div className="footer-top">
          <p className="mono">PRIVATE ACCESS / EARLY DROPS</p>
          <h2>STAY IN<br />THE AURA.</h2>
          <form onSubmit={handleSubmit}>
            <label className="mono" htmlFor="email">YOUR EMAIL</label>
            <div className="input-row">
              <input
                id="email"
                type="email"
                required
                placeholder="NAME@EXAMPLE.COM"
                aria-label="Email address"
              />
              <button type="submit" aria-label="Join the Aura mailing list">
                {submitted ? "JOINED" : "JOIN"} <Arrow />
              </button>
            </div>
          </form>
        </div>
        <div className="footer-links mono">
          <span>NEW YORK / 40.7128° N</span>
          <div>
            <a href="#top">INSTAGRAM</a>
            <a href="#top">TIKTOK</a>
            <a href="#top">CONTACT</a>
          </div>
          <a href="#top">BACK TO TOP ↑</a>
        </div>
        <div className="signature" aria-label="Aura 2026">
          AURA <span>—</span> 2026.
        </div>
      </footer>
    </main>
  );
}
