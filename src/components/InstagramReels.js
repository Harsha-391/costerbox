/* src/components/InstagramReels.js */
'use client';
import React from 'react';
import '../styles/instagram_reels.css';
import { Instagram, Play } from 'lucide-react';

const REEL_IDS = [
    "DUaqDmcEz7c",
    "DQ4W0hREoZf",
    "C-ki8UUSmWN"
];

export default function InstagramReels() {
    return (
        <section className="reels-section">
            <div className="reels-header">
                <div className="reels-title-wrap">
                    <Instagram size={24} className="ig-icon" />
                    <h2>Costerbox in Motion</h2>
                </div>
                <p>Witness the artistry behind every stitch. Handcrafted with love in Jaipur.</p>
            </div>

            <div className="reels-grid">
                {REEL_IDS.map((id, index) => (
                    <div key={id} className="reel-card">
                        <div className="reel-iframe-container">
                            <iframe
                                src={`https://www.instagram.com/reel/${id}/embed`}
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency="true"
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                title={`Instagram Reel ${index + 1}`}
                            ></iframe>
                        </div>
                    </div>
                ))}
            </div>

            <div className="reels-footer">
                <a
                    href="https://www.instagram.com/costerbox/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reels-follow-btn"
                >
                    Follow us on Instagram
                </a>
            </div>
        </section>
    );
}
