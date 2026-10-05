"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

const media = images.map(url => ({ type: 'image' as const, url }));

export default function Gallery({ branches, event, autoOpen = false }: { branches?: { id: string | number; name: string }[], event?: { id?: string | number; name?: string; isActive?: boolean; deadline?: string | Date | null } | null, autoOpen?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(25);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && visibleCount < media.length) {
          setVisibleCount(prev => Math.min(prev + 12, media.length));
        }
      });
      observerRef.current.observe(node);
    }
  }, [visibleCount]);

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
          <div style={{ marginBottom: "1rem", marginTop: "-1rem" }}>
            <Image 
              src="/LCC-LOGO.png" 
              alt="LCC Logo" 
              width={100} 
              height={100} 
              style={{ objectFit: 'contain' }}
              unoptimized 
            />
          </div>
          {/* Faux logo / Title graphic similar to the Next.js Conf logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
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
          </div>
        ))}
      </div>

      {visibleCount < media.length && (
        <div ref={lastElementRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '4rem' }}>
          <div style={{ color: "#a1a1aa", fontSize: "0.95rem" }}>Loading more...</div>
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className={styles.lightbox} onClick={() => setSelectedIndex(null)}>
          
          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
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
