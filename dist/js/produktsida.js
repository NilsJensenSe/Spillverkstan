document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.querySelector("#produktsida .main-image");
  const thumbnails = document.querySelectorAll("#produktsida .mindre img");

  if (!mainImage || thumbnails.length === 0) return;

  // === Bildlistan ===
  const images = Array.from(thumbnails).map(img => img.src);

  // === Lightbox-element ===
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const closeBtn = document.querySelector("#lightbox .close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  let currentIndex = 0;
  let scale = 1; 
  let isPanning = false;
  let startX, startY, translateX = 0, translateY = 0;

  // === Funktion: visa lightbox ===
  function showLightboxFromMain() {
    const currentSrc = mainImage.src;
    const foundIndex = images.indexOf(currentSrc);
    currentIndex = foundIndex !== -1 ? foundIndex : 0;
    showLightbox(currentIndex);
  }

  function showLightbox(index) {
    lightboxImg.src = images[index];
    lightbox.classList.remove("hidden");

    // reset zoom/pan
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  // === Hover på thumbnails byter main ===
  thumbnails.forEach(thumb => {
    thumb.addEventListener("mouseenter", () => {
      mainImage.src = thumb.src;
    });
  });

  // === Klick för att öppna lightbox ===
  mainImage.addEventListener("click", showLightboxFromMain);
  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
      showLightboxFromMain();
    });
  });

  // === Stäng lightbox ===
  closeBtn.addEventListener("click", () => {
    lightbox.classList.add("hidden");
  });

  // === Bläddra vänster/höger ===
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showLightbox(currentIndex);
  });
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    showLightbox(currentIndex);
  });

  // === Tangentbordskontroller (vänster/höger/esc) ===
  window.addEventListener("keydown", e => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "Escape") closeBtn.click();
  });

  // === Zoom & pan ===
  function updateTransform() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Zoom med musens hjul
  lightbox.addEventListener("wheel", e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.min(Math.max(1, scale + delta), 4);
    updateTransform();
  });

  // Pan med mus
  lightboxImg.addEventListener("mousedown", e => {
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxImg.style.cursor = "grabbing";
  });
  window.addEventListener("mouseup", () => {
    isPanning = false;
    lightboxImg.style.cursor = "default";
  });
  window.addEventListener("mousemove", e => {
    if (!isPanning) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });

  // Pinch på touch
  let initialDistance = 0;
  lightbox.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
    }
  }, { passive: false });

  lightbox.addEventListener("touchmove", e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const diff = newDistance - initialDistance;
      scale = Math.min(Math.max(1, scale + diff / 200), 4);
      initialDistance = newDistance;
      updateTransform();
    }
  }, { passive: false });

  // === Accordion för info-sektionerna ===
  document.querySelectorAll("#produktsida .info .section h4").forEach(header => {
    header.addEventListener("click", () => {
      const section = header.parentElement;
      section.classList.toggle("active");
    });
  });
});
