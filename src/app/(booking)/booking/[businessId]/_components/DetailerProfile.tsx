"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Detailer } from '@/lib/models/detailer';

interface DetailerProfileProps {
  detailer: Detailer;
}

export default function DetailerProfile({ detailer }: DetailerProfileProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-4 mb-4">
        {detailer.profileImage ? (
          <Image
            src={detailer.profileImage}
            alt={detailer.businessName}
            className="w-16 h-16 rounded-full object-cover"
            width={64}
            height={64}
          />
        ) : (
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{detailer.businessName}</h2>
          {detailer.location && (
            <div className="flex items-center mt-1">
              <svg className="h-4 w-4 mr-1.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">{detailer.location}</p>
            </div>
          )}
        </div>
      </div>
      {detailer.bio && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{detailer.bio}</p>
      )}
      {/* Gallery Images Carousel */}
      {detailer.galleryImages && detailer.galleryImages.length > 0 && (
        <div className="mb-4">
          <Swiper
            spaceBetween={16}
            slidesPerView={1}
            navigation
            modules={[Navigation]}
            className="w-full rounded-xl"
            style={{ maxWidth: '100%' }}
          >
            {detailer.galleryImages.map((img, idx) => (
              <SwiperSlide key={img}>
                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 cursor-pointer" onClick={() => { setLightboxOpen(true); setLightboxIndex(idx); }}>
                  <Image
                    src={img}
                    alt={`Gallery image ${idx + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover transition-transform duration-200 hover:scale-105"
                    priority={idx === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Lightbox Modal */}
          {lightboxOpen && detailer.galleryImages && detailer.galleryImages.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setLightboxOpen(false)}>
              <div className="relative max-w-2xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-white text-2xl z-10" onClick={() => setLightboxOpen(false)}>&times;</button>
                <Image
                  src={detailer.galleryImages[lightboxIndex] || ''}
                  alt={`Gallery image ${lightboxIndex + 1}`}
                  width={1200}
                  height={700}
                  className="w-full max-h-[80vh] object-contain rounded-xl"
                  priority
                />
                <div className="flex justify-between w-full mt-4">
                  <button
                    className="text-white text-3xl px-4 py-2"
                    onClick={() => setLightboxIndex((lightboxIndex - 1 + (detailer.galleryImages?.length || 1)) % (detailer.galleryImages?.length || 1))}
                  >&#8592;</button>
                  <button
                    className="text-white text-3xl px-4 py-2"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % (detailer.galleryImages?.length || 1))}
                  >&#8594;</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* End Gallery Images Carousel */}
    </div>
  );
}
