"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Gallery.module.css";
import RegistrationModal from "./RegistrationModal";

const images = [
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3022.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3015.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3010.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3004.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3003.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_3002.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_2995.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_2993.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_2991.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_2990.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1282.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1271.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1269.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1268.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1265.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1264.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1260.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1249.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1238.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1192.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1185.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_1142.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0930.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0888.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0853.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0317.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0322.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0291.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0186.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0119.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0092.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0011.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z48.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z4.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z37.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z27.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z23.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z13.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-95.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-91.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-88.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-80.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-68.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-61.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-52.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-47.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-403.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-172.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-177.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-175.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-18.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-186.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-198.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Vercel_Next_Conference-6.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z1.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z2.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z19.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/2022_Z11.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0017.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0291.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0317.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0322.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0360.jpg",
  "https://msz8xzwxzifxtllw.public.blob.vercel-storage.com/Sexton_Vercel_0521.jpg",
];

const videos = [
  "gLRgfTc9Juw" // Extracting the video ID from the provided link
];

const media = [
  ...videos.map(id => ({ type: 'video' as const, id, url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` })),
  ...images.map(url => ({ type: 'image' as const, url }))
];

export default function Gallery({ branches, event, autoOpen = false }: { branches?: any[], event?: any, autoOpen?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (selectedIndex !== null) {
      const activeThumb = document.getElementById(`thumb-${selectedIndex}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

  const handleImageLoad = (idx: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % media.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
    }
  };

  return (
    <>
      <div className={styles.galleryGrid}>
        {/* Hero Card embedded in the grid */}
        <div className={styles.heroCard}>
          {/* Faux logo / Title graphic similar to the Next.js Conf logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '-2rem' }}>
            <h1 style={{ fontFamily: "var(--font-dancing), cursive", fontSize: "2.8rem", whiteSpace: "nowrap", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center" }}>
              Multiply Sunday
            </h1>
          </div>
          
          <h2 style={{ fontSize: "0.9rem", fontWeight: "700", letterSpacing: "0.1em", color: "#2b3ff2", marginBottom: "1.5rem", textTransform: "uppercase" }}>
            Theme: Get The Most Important Thing
          </h2>
          
          <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginBottom: "3rem", lineHeight: "1.5", maxWidth: "260px", fontWeight: "400" }}>
            Join our incredible community as we gather for our most anticipated Sunday!
          </p>
          
          {/* Button styled minimally */}
          <button style={{ 
            backgroundColor: "#fff", 
            color: "#000", 
            border: "none", 
            padding: "8px 24px", 
            borderRadius: "6px", 
            fontWeight: "600", 
            fontSize: "0.85rem",
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e4e4e7"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
          onClick={() => setIsModalOpen(true)}
          >
            Register Now
          </button>
        </div>

        {/* Media Cards (Videos and Images unified) */}
        {media.map((item, idx) => (
          <div 
            key={idx} 
            className={styles.galleryItem}
            onClick={() => setSelectedIndex(idx)}
          >
            {/* Custom Manual Blur Placeholder */}
            <div className={`${styles.blurPlaceholder} ${loadedImages.has(idx) ? styles.loaded : ''}`} />
            
            {item.type === 'image' ? (
              <Image
                src={item.url}
                alt={`Event Media ${idx + 1}`}
                width={640}
                height={427} 
                className={styles.image}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                loading="lazy"
                unoptimized={true}
                onLoad={() => handleImageLoad(idx)}
              />
            ) : (
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', zIndex: 1, borderRadius: '8px' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${item.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${item.id}&rel=0&modestbranding=1&playsinline=1`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none', transform: 'scale(1.35)' }}
                  allow="autoplay; encrypted-media"
                  onLoad={() => handleImageLoad(idx)}
                />
              </div>
            )}

            {item.type === 'video' && (
              <div className={styles.playOverlay}>
                <div className={styles.playButton}>▶</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className={styles.lightbox} onClick={() => setSelectedIndex(null)}>
          
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            {media[selectedIndex].type === 'video' ? (
              <iframe
                src={`https://www.youtube.com/embed/${media[selectedIndex].id}?autoplay=1`}
                title="Multiply Sunday Video"
                className={styles.lightboxImage}
                style={{ border: 'none', backgroundColor: '#000', width: '90vw', maxWidth: '1200px', aspectRatio: '16/9' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img 
                key={selectedIndex}
                src={media[selectedIndex].url}
                alt="Full size event photo"
                className={styles.lightboxImage}
              />
            )}

            {/* Controls are now INSIDE the image container, overlaying the image */}
            <button 
              className={styles.closeButton} 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>

            {media[selectedIndex].type === 'image' && (
              <a 
                href={media[selectedIndex].url}
                download={`Multiply_Sunday_Photo_${selectedIndex + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadButton}
                onClick={(e) => e.stopPropagation()}
                title="Download Image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </a>
            )}
            
            <button className={styles.lightboxPrev} onClick={prevImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>
            </button>
            <button className={styles.lightboxNext} onClick={nextImage}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>

          {/* Thumbnail Slider */}
          <div className={styles.thumbnailSlider} onClick={(e) => e.stopPropagation()}>
            {media.map((item, idx) => (
              <div 
                key={idx} 
                id={`thumb-${idx}`}
                className={`${styles.thumbnailItem} ${selectedIndex === idx ? styles.thumbnailItemActive : ''}`}
                onClick={() => setSelectedIndex(idx)}
              >
                <Image src={item.url} alt={`Thumb ${idx + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" unoptimized={true} />
                {item.type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ color: '#fff', fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>▶</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Modal Popup */}
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        branches={branches}
        event={event}
      />
    </>
  );
}
