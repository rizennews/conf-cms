"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Gallery.module.css";
import RegistrationModal from "./RegistrationModal";

const images = [
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/53737542391_4685d1869a_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/53737737663_a5c46660da_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/53737868339_2022f829ce_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/53737962215_a0efe70b5e_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54079555827_82d6c01fcc_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080445361_8e7bf159fc_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080462361_00705057a9_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080464351_66f303dc31_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080515346_29bbd55140_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080726398_a16da1b183_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080768489_475fc6825e_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080797854_bc6fbd9825_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080920550_3ea947064e_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54080940730_9df1601553_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54135871728_34c2f36140_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54135920949_d7e91e7ff1_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54976545077_f369cd2408_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54976550597_bcea8125db_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54977446721_a1ef283de1_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54977452511_36d648a9a6_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54982227412_c4b67939c1_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54136040645_d40513ea87_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54977605343_8f69fc6d58_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54134739772_fc57293bbb_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54135872273_26b0467252_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54063176367_66cac1668d_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54063208017_3b88161cbd_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54064281658_b7a8461bfe_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54064531000_acbdcc16d7_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54134731702_29c47f7962_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54134735507_e05515c1f9_b.jpg",
  "https://pub-9fd6b1914c8045a1b81ad2d1ca6b539c.r2.dev/54136042295_df4c84fcb2_b.jpg",
];

const videos = [
  "gLRgfTc9Juw" // Extracting the video ID from the provided link
];

const media = [
  ...videos.map(id => ({ type: 'video' as const, id, url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` })),
  ...images.map(url => ({ type: 'image' as const, url }))
];

export default function Gallery({ branches, event, autoOpen = false }: { branches?: { id: string | number; name: string }[], event?: { id?: string | number; name?: string; isActive?: boolean; deadline?: string | Date | null } | null, autoOpen?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(12);

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
        {media.slice(0, visibleCount).map((item, idx) => (
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

      {visibleCount < media.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '4rem' }}>
          <button 
            onClick={() => setVisibleCount(prev => Math.min(prev + 12, media.length))}
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "12px 32px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Load More Photos
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className={styles.lightbox} onClick={() => setSelectedIndex(null)}>
          
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            {media[selectedIndex].type === 'video' ? (
              <iframe
                src={`https://www.youtube.com/embed/${(media[selectedIndex] as { type: 'video', id: string }).id}?autoplay=1`}
                title="Multiply Sunday Video"
                className={styles.lightboxImage}
                style={{ border: 'none', backgroundColor: '#000', width: '90vw', maxWidth: '1200px', aspectRatio: '16/9' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Image 
                key={selectedIndex}
                src={media[selectedIndex].url}
                alt="Full size event photo"
                className={styles.lightboxImage}
                width={1920}
                height={1080}
                style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '90vh', width: 'auto', height: 'auto' }}
                unoptimized
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
