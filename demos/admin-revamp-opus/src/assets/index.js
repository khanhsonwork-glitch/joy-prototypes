// Images made with Codex image generation for this prototype, 18/11/2026 (prompts: no text, no brand marks,
// no real shop data). Marketing art sits in "New in Joy" cards, tier art behind the membership card,
// spot art in empty states. UI itself is never an AI image: screens are real Polaris components.
import credit from './img/mkt-credit.jpg';
import banner from './img/mkt-banner.jpg';
import wallet from './img/mkt-wallet.jpg';
import bronze from './img/tier-bronze.jpg';
import silver from './img/tier-silver.jpg';
import gold from './img/tier-gold.jpg';
import black from './img/tier-black.jpg';
import members from './img/empty-members.jpg';
import rewards from './img/empty-rewards.jpg';
import referral from './img/empty-referral.jpg';
// Photoreal on-brand shots for the fictional shop (Alex 18/11: "AI gen image thì có image nhìn onbrand").
import heroDesktop from './img/photo-hero-desktop.jpg';
import heroMobile from './img/photo-hero-mobile.jpg';
import referralPhoto from './img/photo-referral.jpg';
import miniJar from './img/photo-mini-jar.jpg';
import giftSet from './img/photo-gift-set.jpg';
import texture from './img/photo-texture.jpg';
import giftBox from './img/photo-gift-box.jpg';

export const MKT_ART = {credit, banner: heroDesktop, wallet};
export const PHOTOS = {heroDesktop, heroMobile, referral: referralPhoto, miniJar, giftSet, texture, giftBox};
export const TIER_ART = {bronze, silver, gold, black};
export const EMPTY_ART = {members, rewards, referral};
