/**
 * KINDpos — Hex Math
 * Pure geometry from kindpos-order-screen-v2.html prototype.
 * Flat-top hex with -PI/2 angle offset, GAP = 1.08.
 */

const GAP = 1.08;

export function hexPoints(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return pts.join(' ');
}

export function facePosition(cx, cy, parentRadius, childRadius, face) {
    const dist = (Math.sqrt(3) / 2) * (parentRadius + childRadius) * GAP;
    const angle = (Math.PI / 3) * face;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
}

export function oppositeFace(f) { return (f + 3) % 6; }

export function getBloomOrder(parentFace, occupiedFaces = []) {
    if (parentFace === null) return [0, 1, 2, 3, 4, 5].filter(f => !occupiedFaces.includes(f));
    const parentDir = oppositeFace(parentFace);
    const awayDir = parentFace;
    const faces = [0, 1, 2, 3, 4, 5];
    faces.sort((a, b) => {
        const distA = Math.min(Math.abs(a - awayDir), 6 - Math.abs(a - awayDir));
        const distB = Math.min(Math.abs(b - awayDir), 6 - Math.abs(b - awayDir));
        return distA - distB;
    });
    return faces.filter(f => ![...occupiedFaces, parentDir].includes(f));
}

export function inBounds(x, y, r, vb) {
    const m = 12;
    return x - r > vb.x + m && x + r < vb.x + vb.w - m &&
           y - r > vb.y + m && y + r < vb.y + vb.h - m;
}

export function collides(x, y, r, placed) {
    const MIN_GAP = 4;
    for (const p of placed) {
        const dx = x - p.x, dy = y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < (Math.sqrt(3) / 2) * (r + p.r) + MIN_GAP) return true;
    }
    return false;
}

export function getSmartBloomOrder(cx, cy, parentRadius, childRadius, parentFace, occupiedFaces = [], vb) {
    const preferred = getBloomOrder(parentFace, occupiedFaces);
    const inB = [], outB = [];
    for (const face of preferred) {
        const pos = facePosition(cx, cy, parentRadius, childRadius, face);
        (inBounds(pos.x, pos.y, childRadius, vb) ? inB : outB).push(face);
    }
    return [...inB, ...outB];
}
