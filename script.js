document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav a");

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          const id = entry.target.getAttribute("id");
          navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
  );

  sections.forEach(section => sectionObserver.observe(section));

  const toolsSection = document.getElementById("tools-section");
  const icons = document.querySelectorAll(".tool-icon");
  const assembleBtn = document.getElementById("assemble-btn");

  if (!toolsSection || !icons.length || !assembleBtn) {
    console.warn("Required elements not found for icon animation");
    return;
  }
  
  let isAssembled = false;
  let animationFrameId = null;
  const velocities = [];
  const positions = [];
  const iconSize = 60;
  const bounceFactor = 0.9;
  const cursorRadius = 30;


  

  let mouse = { x: null, y: null };

  toolsSection.addEventListener('mousemove', (e) => {
    const rect = toolsSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  toolsSection.addEventListener('click', () => {
    icons.forEach((_, i) => {
      velocities[i].x += (Math.random() - 0.5) * 10;
      velocities[i].y += (Math.random() - 0.5) * 10;
    });
  });
  

  toolsSection.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function initializeIcons() {
    const containerWidth = toolsSection.offsetWidth;
    const containerHeight = toolsSection.offsetHeight;

    icons.forEach((icon, index) => {
      const x = Math.random() * (containerWidth - iconSize);
      const y = Math.random() * (containerHeight - iconSize);

      icon.style.position = "absolute";
      icon.style.width = `${iconSize}px`;
      icon.style.height = `${iconSize}px`;
      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;

      positions[index] = { x, y };
      velocities[index] = {
        x: (Math.random() * 4 - 2),
        y: (Math.random() * 4 - 2)
      };
    });
  }

  function handleCollisions() {
    for (let i = 0; i < icons.length; i++) {
      for (let j = i + 1; j < icons.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < iconSize) {
          // Simple elastic collision response
          const angle = Math.atan2(dy, dx);
          const speed = 1;

          velocities[i].x += Math.cos(angle) * speed;
          velocities[i].y += Math.sin(angle) * speed;

          velocities[j].x -= Math.cos(angle) * speed;
          velocities[j].y -= Math.sin(angle) * speed;
        }
      }
    }
  }

  function applyMouseRepulsion(index) {
    if (mouse.x === null || mouse.y === null) return;
  
    const icon = icons[index];
    const dx = positions[index].x + iconSize / 2 - mouse.x;
    const dy = positions[index].y + iconSize / 2 - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 80) {
      icons[index].style.transform = 'scale(1.2)';
      setTimeout(() => {
        icons[index].style.transform = 'scale(1)';
      }, 150);
    }
    
  
    if (dist < 150 && dist > 0) {
      const force = 6 / dist;
      velocities[index].x += (dx / dist) * force;
      velocities[index].y += (dy / dist) * force;
  
      // Optional: Add temporary visual feedback
      icon.style.transform = `scale(${1 + 0.3 * (1 - dist / 150)})`;
      icon.style.filter = `brightness(${1.5 - dist / 150})`;
      icon.style.zIndex = 1;
    } else {
      icon.style.transform = "scale(1)";
      icon.style.filter = "brightness(1)";
      icon.style.zIndex = 0;
    }
  }
  

  function animateIcons() {
    if (isAssembled) return;

    const containerWidth = toolsSection.offsetWidth;
    const containerHeight = toolsSection.offsetHeight;

    handleCollisions();

    icons.forEach((icon, index) => {
      applyMouseRepulsion(index);

      let { x, y } = positions[index];

      x += velocities[index].x;
      y += velocities[index].y;

      if (x <= 0 || x + iconSize >= containerWidth) {
        velocities[index].x *= -bounceFactor;
        x = Math.max(0, Math.min(containerWidth - iconSize, x));
      }

      if (y <= 0 || y + iconSize >= containerHeight) {
        velocities[index].y *= -bounceFactor;
        y = Math.max(0, Math.min(containerHeight - iconSize, y));
      }

      positions[index] = { x, y };
      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;
    });

    animationFrameId = requestAnimationFrame(animateIcons);
  }

  function startFloating() {
    stopFloating();
    animateIcons();
  }

  function stopFloating() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function assembleIcons() {
    const containerWidth = toolsSection.offsetWidth;
    const containerHeight = toolsSection.offsetHeight;
    const cols = Math.max(1, Math.floor(containerWidth / (iconSize + 20)));
    const rows = Math.ceil(icons.length / cols);

    const startX = (containerWidth - (cols * (iconSize + 20) - 20)) / 2;
    const startY = (containerHeight - (rows * (iconSize + 20) - 20)) / 2;

    icons.forEach((icon, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = startX + col * (iconSize + 20);
      const y = startY + row * (iconSize + 20);

      icon.style.transition = "all 0.5s ease-out";
      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;
    });
  }

  assembleBtn.addEventListener("click", function () {
    isAssembled = !isAssembled;
    toolsSection.classList.toggle("assembled", isAssembled);
    assembleBtn.textContent = isAssembled ? "Scatter" : "Assemble";

    if (isAssembled) {
      stopFloating();
      assembleIcons();
    } else {
      icons.forEach((icon, index) => {
        icon.style.transition = "none";
        positions[index] = {
          x: Math.random() * (toolsSection.offsetWidth - iconSize),
          y: Math.random() * (toolsSection.offsetHeight - iconSize)
        };
        velocities[index] = {
          x: (Math.random() * 2 - 1),
          y: (Math.random() * 2 - 2)
        };
        icon.style.left = `${positions[index].x}px`;
        icon.style.top = `${positions[index].y}px`;
      });
      setTimeout(() => {
        icons.forEach(icon => (icon.style.transition = ""));
      }, 50);
      startFloating();
    }
  });

  window.addEventListener('resize', () => {
    if (isAssembled) {
      assembleIcons();
    }
  });

  // Project scroll buttons
  const scrollWrapper = document.querySelector('.projects-scroll-wrapper');
  const backBtn = document.querySelector('.scroll-btn.left');
  const forwardBtn = document.querySelector('.scroll-btn.right');

  if (scrollWrapper && backBtn && forwardBtn) {
    const scrollAmount = () => {
      const firstCard = scrollWrapper.querySelector('.project-card');
      return firstCard ? firstCard.offsetWidth + 20 : 340;
    };

    const updateButtonStates = () => {
      backBtn.disabled = scrollWrapper.scrollLeft <= 10;
      forwardBtn.disabled = scrollWrapper.scrollLeft >=
        (scrollWrapper.scrollWidth - scrollWrapper.clientWidth - 10);
    };

    scrollWrapper.addEventListener('scroll', updateButtonStates);

    backBtn.addEventListener('click', () => {
      scrollWrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    forwardBtn.addEventListener('click', () => {
      scrollWrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    updateButtonStates();
    window.addEventListener('resize', updateButtonStates);
  }

  // Initialize
  initializeIcons();
  startFloating();
  // Track mouse position
 document.addEventListener("mousemove", e => {
  const rect = toolsSection.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
toolsSection.appendChild(cursorGlow);

toolsSection.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX - toolsSection.getBoundingClientRect().left}px`;
  cursorGlow.style.top = `${e.clientY - toolsSection.getBoundingClientRect().top}px`;
});


});

// Toggle body class "dark-mode"
document.querySelector('#toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
