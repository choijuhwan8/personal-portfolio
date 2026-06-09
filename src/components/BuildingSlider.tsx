"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getBuilds, extractFirstImage, Build } from "@/lib/builds";

export default function BuildingSlider() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);

  useEffect(() => { getBuilds().then((b) => { setBuilds(b); setIsLast(b.length <= 1); }); }, []);

  const onSlideChange = (swiper: SwiperType) => {
    setIsFirst(swiper.isBeginning);
    setIsLast(swiper.isEnd);
  };

  if (builds.length === 0) return (
    <div className="bc-root bc-empty">NO BUILDS YET.</div>
  );

  return (
    <div className="bc-root">
      <div className="bc-row">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          slidesPerGroup={1}
          loop={false}
          navigation
          pagination={{ clickable: true }}
          onSwiper={onSlideChange}
          onSlideChange={onSlideChange}
          className={`bc-swiper${isFirst ? " bc-hide-prev" : ""}${isLast ? " bc-hide-next" : ""}`}
        >
          {builds.map((b, i) => {
            const img = extractFirstImage(b.body);
            return (
              <SwiperSlide key={b.slug} className="bc-slide">
                <Link href={`/building/${b.slug}`} className="bc-slide-link">
                  {img
                    ? <div className="bc-card-img"><img src={img} alt={b.title} draggable={false} /></div>
                    : <div className="bc-card-empty"><span>/ NO IMAGE</span></div>
                  }
                  <div className="bc-card-body">
                    <div className="bc-card-meta">
                      <span className="bc-card-date">{b.date}</span>
                      <span className="bc-card-idx">/{String(builds.length - i).padStart(2, "0")}</span>
                    </div>
                    <div className="bc-card-title">{b.title}</div>
                    {b.dek && <div className="bc-card-dek">{b.dek.length > 90 ? b.dek.slice(0, 90) + "…" : b.dek}</div>}
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <Link href="/building" className="bc-see-all-box">
          <span className="bc-see-all-box-label">SEE ALL BUILDS</span>
          <span className="bc-see-all-box-arr">↗</span>
          <span className="bc-see-all-box-cnt">{builds.length} BUILDS · ARCHIVE</span>
        </Link>
      </div>
    </div>
  );
}
