document.addEventListener('DOMContentLoaded', function() {
  // Section observer for animations
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
    { threshold: 0.2 }
  );

  sections.forEach(section => sectionObserver.observe(section));

  // Floating icons with bounce effect
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

  // Initialize icons with random positions and velocities
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

  // Main animation loop
  function animateIcons() {
    if (isAssembled) return;
  
    const containerWidth = toolsSection.offsetWidth;
    const containerHeight = toolsSection.offsetHeight;
  
    icons.forEach((icon, index) => {
      let { x, y } = positions[index];
  
      x += velocities[index].x;
      y += velocities[index].y;
  
      if (x <= 0) {
        x = 0;
        velocities[index].x = Math.abs(velocities[index].x) * bounceFactor;
      } else if (x + iconSize >= containerWidth) {
        x = containerWidth - iconSize;
        velocities[index].x = -Math.abs(velocities[index].x) * bounceFactor;
      }
  
      if (y <= 0) {
        y = 0;
        velocities[index].y = Math.abs(velocities[index].y) * bounceFactor;
      } else if (y + iconSize >= containerHeight) {
        y = containerHeight - iconSize;
        velocities[index].y = -Math.abs(velocities[index].y) * bounceFactor;
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

  // Toggle between assembled and floating states
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
          x: (Math.random() * 4 - 2),
          y: (Math.random() * 4 - 2)
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
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (isAssembled) {
      assembleIcons();
    }
  });

  // Project scroll functionality
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
});
// Toggle body class "dark-mode" on click
document.querySelector('#toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
