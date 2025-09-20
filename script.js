// Lightweight ready helper: run immediately if DOM is already ready
function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

// Accordion Functionality
ready(() => {
  const accordionToggles = document.querySelectorAll(".accordion-toggle");
  accordionToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.parentElement;
      item.classList.toggle("active");
    });
  });
});
// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggle.classList.toggle("active");
    if (document.body.classList.contains("dark-mode")) {
      darkModeToggle.textContent = "☀️";
    } else {
      darkModeToggle.textContent = "🌙";
    }
  });
}
// Scroll-to-Top Button
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});
if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Responsive Navbar Toggle
const navbarToggle = document.querySelector(".navbar-toggle");
const navbarLinks = document.querySelector(".navbar-links");
if (navbarToggle && navbarLinks) {
  navbarToggle.addEventListener("click", () => {
    navbarLinks.classList.toggle("active");
  });
}

// Gallery Modal Popup
ready(() => {
  // Set copyright year dynamically
  try {
    const yearEl = document.getElementById("copyrightYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (err) {}
  const galleryImages = document.querySelectorAll(".gallery-img");
  galleryImages.forEach((img) => {
    img.addEventListener("click", () => {
      showModal(img.src, img.alt);
    });
  });

  // Code card controls: copy and view
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".code-card");
      const codeEl = card && card.querySelector(".code-snippet");
      const code = codeEl ? codeEl.textContent : "";
      navigator.clipboard
        ?.writeText(code)
        .then(() => {
          showToast("Copied to clipboard");
          const prev = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = prev || "Copy"), 1500);
        })
        .catch(() => {
          alert("Copy failed. Select and copy manually.");
        });
    });
  });

  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".code-card");
      const codeEl = card && card.querySelector(".code-snippet");
      const code = codeEl ? codeEl.textContent : "";
      showCodeModal(code);
    });
  });

  // Scroll-triggered animations
  const animatedEls = document.querySelectorAll(".fade-in, .slide-up");
  const animateOnScroll = () => {
    animatedEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.style.opacity = 1;
        el.style.transform = "none";
      }
    });
  };
  animateOnScroll();
  window.addEventListener("scroll", animateOnScroll);
});

function showModal(src, alt) {
  let modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  // create a unique id for the modal title and include it for screen readers
  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 9);
  modal.innerHTML = `
    <div class="modal-content" aria-labelledby="${titleId}">
      <div class="modal-title" id="${titleId}">${alt || "Image"}</div>
      <span class="modal-close" tabindex="0" aria-label="Close">&times;</span>
      <img src="${src}" alt="${alt}" style="max-width:100%; border-radius:8px;">
      <div class="modal-caption">${alt}</div>
    </div>
  `;
  const previouslyFocused = document.activeElement;
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  const closeEl = modal.querySelector(".modal-close");

  // Close handler that also restores focus and cleans up listeners
  function closeModal() {
    try {
      cleanupKeyListener();
      modal.remove();
      document.body.style.overflow = "";
      if (previouslyFocused && previouslyFocused.focus)
        previouslyFocused.focus();
    } catch (err) {}
  }

  closeEl.addEventListener("click", closeModal);
  closeEl.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") closeModal();
  });

  // clicking backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Basic focus trap
  const focusableSelector =
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(modal.querySelectorAll(focusableSelector));
  const firstFocusable =
    focusable[0] || closeEl || modal.querySelector(".modal-title");
  const lastFocusable = focusable[focusable.length - 1] || closeEl;

  function keyListener(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      if (focusable.length === 0) {
        e.preventDefault();
        closeEl.focus();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  document.addEventListener("keydown", keyListener);
  function cleanupKeyListener() {
    document.removeEventListener("keydown", keyListener);
  }

  // move focus into modal
  setTimeout(() => {
    try {
      firstFocusable && firstFocusable.focus && firstFocusable.focus();
    } catch (e) {}
  }, 10);
}

function showCodeModal(code) {
  let modal = document.createElement("div");
  modal.className = "modal code-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const titleId = "modal-title-" + Math.random().toString(36).slice(2, 9);
  modal.innerHTML = `
    <div class="modal-content" aria-labelledby="${titleId}">
      <div class="modal-title" id="${titleId}">Code Preview</div>
      <span class="modal-close" tabindex="0" aria-label="Close">&times;</span>
      <pre><code class="hljs">${escapeHtml(code)}</code></pre>
      <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
        <button class="modal-copy">Copy code</button>
        <button class="modal-close-btn">Close</button>
      </div>
    </div>
  `;
  const previouslyFocused = document.activeElement;
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  const closeButtons = modal.querySelectorAll(".modal-close, .modal-close-btn");
  function closeModal() {
    try {
      cleanupKeyListener();
      modal.remove();
      document.body.style.overflow = "";
      if (previouslyFocused && previouslyFocused.focus)
        previouslyFocused.focus();
    } catch (err) {}
  }
  closeButtons.forEach((b) => b.addEventListener("click", closeModal));

  // highlight the code using highlight.js if available
  try {
    if (window.hljs) {
      const codeEl = modal.querySelector("pre code");
      hljs.highlightElement(codeEl);
    }
  } catch (err) {
    // ignore highlighting errors
  }
  // modal copy button
  const modalCopy = modal.querySelector(".modal-copy");
  if (modalCopy) {
    modalCopy.addEventListener("click", () => {
      const text = modal.querySelector("pre code").textContent;
      navigator.clipboard
        ?.writeText(text)
        .then(() => showToast("Copied to clipboard"))
        .catch(() => alert("Copy failed"));
    });
  }

  // clicking backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Basic focus trap
  const focusableSelector =
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(modal.querySelectorAll(focusableSelector));
  const firstFocusable =
    focusable[0] ||
    modal.querySelector(".modal-close") ||
    modal.querySelector(".modal-title");
  const lastFocusable =
    focusable[focusable.length - 1] || modal.querySelector(".modal-close");

  function keyListener(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      if (focusable.length === 0) {
        e.preventDefault();
        (modal.querySelector(".modal-close") || modal).focus();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }

  document.addEventListener("keydown", keyListener);
  function cleanupKeyListener() {
    document.removeEventListener("keydown", keyListener);
  }

  // move focus into modal
  setTimeout(() => {
    try {
      firstFocusable && firstFocusable.focus && firstFocusable.focus();
    } catch (e) {}
  }, 10);
}

// Toast helper
function showToast(message, timeout = 1800) {
  try {
    const container = document.getElementById("toast");
    if (!container) return;
    const msg = document.createElement("div");
    msg.className = "toast-message";
    msg.textContent = message;
    container.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 300);
    }, timeout);
  } catch (err) {
    // ignore
  }
}

// Helper: escape HTML for safe display in code modal
function escapeHtml(unsafe) {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Smooth scrolling for internal links and sandbox handlers
ready(() => {
  // Smooth scroll for same-page anchors (accounts for sticky navbar)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navbar = document.querySelector(".navbar");
      const offset = navbar ? navbar.offsetHeight + 12 : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      // update the URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      } else {
        location.hash = href;
      }
    });
  });

  // Sandbox run/reset using an isolated iframe via srcdoc
  const runBtn = document.getElementById("runSandbox");
  const resetBtn = document.getElementById("resetSandbox");
  const sandboxInput = document.getElementById("sandboxInput");
  const preview = document.getElementById("sandboxPreview");
  if (sandboxInput && preview) {
    const defaultContent = sandboxInput.value;

    // Helper to render content into a sandboxed iframe
    function renderPreviewHtml(html) {
      // clear previous preview
      preview.innerHTML = "";
      const iframe = document.createElement("iframe");
      // sandbox attribute prevents access to parent; allow-scripts if you want scripts to run
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.style.width = "100%";
      iframe.style.minHeight = "160px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "6px";
      // Inject a small console-capture script that forwards console messages to the parent
      const captureScript = `
        <script>
        (function(){
          function forward(type, args){
            try{ parent.postMessage({ __sandboxLog: true, type: type, args: args.map(a=>{try{return typeof a==='object'?JSON.stringify(a):String(a)}catch(e){return String(a)}}) }, '*'); }catch(e){}
          }
          ['log','info','warn','error'].forEach(fn=>{
            const orig = console[fn];
            console[fn] = function(){ forward(fn, Array.from(arguments)); try{ orig.apply(console, arguments); }catch(e){} };
          });
          window.addEventListener('error', function(e){ forward('error', [e.message + ' (line: '+(e.lineno||'?')+')']); });
        })();
        <\/script>
      `;
      iframe.srcdoc = `<!doctype html><html><head></head><body>${captureScript}${html}</body></html>`;
      preview.appendChild(iframe);
    }

    // initial render
    renderPreviewHtml(defaultContent);

    if (runBtn) {
      runBtn.addEventListener("click", () => {
        renderPreviewHtml(sandboxInput.value);
        // Announce for assistive tech
        preview.setAttribute("aria-live", "polite");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        sandboxInput.value = defaultContent;
        renderPreviewHtml(defaultContent);
      });
    }
  }

  // Sandbox console capture: receive messages from iframe and display
  const sandboxConsole = document.getElementById("sandboxConsole");
  function appendConsoleLine(type, parts) {
    if (!sandboxConsole) return;
    sandboxConsole.style.display = "block";
    const line = document.createElement("div");
    line.textContent = `[${type}] ` + parts.join(" ");
    line.style.marginBottom = "6px";
    if (type === "error") line.style.color = "#ffb4b4";
    else if (type === "warn") line.style.color = "#ffdba4";
    sandboxConsole.appendChild(line);
    sandboxConsole.scrollTop = sandboxConsole.scrollHeight;
  }

  window.addEventListener("message", (e) => {
    try {
      const data = e.data || {};
      if (data && data.__sandboxLog) {
        appendConsoleLine(data.type, data.args || []);
      }
    } catch (err) {
      /* ignore */
    }
  });

  // If a clear button is desired, we can add one dynamically
  if (sandboxConsole) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear Console";
    clearBtn.style.marginBottom = "8px";
    clearBtn.addEventListener("click", () => {
      sandboxConsole.innerHTML = "";
      sandboxConsole.style.display = "none";
    });
    sandboxConsole.parentNode.insertBefore(clearBtn, sandboxConsole);
  }

  // Contact form submission via Formspree (client-side)
  const contactForm = document.getElementById("contactForm");
  const contactFeedback = document.getElementById("contactFeedback");
  if (contactForm && contactFeedback) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactFeedback.textContent = "Sending...";
      const endpoint =
        contactForm.dataset.formspreeEndpoint || contactForm.action;
      const formData = new FormData(contactForm);
      // Convert to JSON
      const payload = {};
      formData.forEach((v, k) => (payload[k] = v));

      fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((body) => Promise.reject(body));
        })
        .then(() => {
          contactFeedback.style.color = "#2a7f43";
          contactFeedback.textContent = "Thanks — your message was sent.";
          contactForm.reset();
        })
        .catch((err) => {
          contactFeedback.style.color = "#a33";
          contactFeedback.textContent =
            "Sending failed. Please try again or email me directly.";
          console.error("Form submission error", err);
        });
    });
  }
});
