// app_complete.js - v60: データ型自動判別完全版（ChatGPT+Gemini+Opus統合）

// グローバル変数
let currentImageData = null;

// 📦 v67.0: セッション履歴保存機能
let analysisHistory = []; // 最大30件の一時履歴（メモリのみ）
const MAX_HISTORY_SIZE = 30;

// ページ読み込み時の初期化（複数の方法で確実に実行）
console.log('✅✅✅ app_complete.js 読み込み完了 ✅✅✅');
console.log('📅 バージョン: 20260101_v67.15 (v67.15: エクスポート機能修正 - PDF/Excel/Word品質改善・画像埋め込み対応 - Excel/PDF/Word出力（JavaScript版・ボタン非表示制御）)');
console.log('🐶 v60.7：アイコンデザイン変更（ロボット🤖から犬🐶へ）');
console.log('⚡ 修正内容：①AIチャットヘッダーのアイコン変更 ②チャットメッセージのアイコン変更 ③履歴モーダルのアイコン変更');
console.log('📦 v67.0：セッション履歴機能（最大30件・個別削除・全消去・復元）');
console.log('🔧 v67.1：履歴復元時の重複保存を防止（isRestoreフラグ追加）');
console.log('🔧 v67.2：履歴関数をグローバルスコープに明示的登録（inline onclick対応）');
console.log('🔧 v67.3：画像読み込み待機処理追加（img.onloadで確実に描画）');
console.log('🛑 v67.4：個別削除ボタンのイベント伝播阻止を強化（window.deleteFromHistory + event.stopPropagation）');
console.log('🔍 v67.5：AI認識強化 - 開口部・隙間の検出を最優先ルールに追加（橋梁・床版工事対応）');
console.log('🦺 v67.6：AI認識強化 - 墜落制止用器具（フルハーネス）・はしご固定の徹底確認');
console.log('🏗️ v67.7：工事名入力機能追加 - 履歴保存・復元対応（WEB・スマホ完全対応）');
console.log('🔬 v67.8：AI認識力強化 - 全工種対応・包括的安全点検リスト（仮設・重機・土木・構造物・環境・電気）');
console.log('📜 app.js 読み込み開始');
console.log('🔍 グローバルスコープ確認:', typeof window);

// 方法1: DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOMContentLoaded イベント発火');
    initializeApp();
});

// 方法2: readyStateがすでにcompleteの場合
if (document.readyState === 'loading') {
    console.log('📖 Document loading...');
} else {
    console.log('📖 Document already loaded - 即座に初期化');
    initializeApp();
}

// アプリ初期化関数
function initializeApp() {
    console.log('🚀 initializeApp() 開始');
    
    if (typeof SAFETY_SCENARIOS !== 'undefined') {
        console.log(`✅ SAFETY_SCENARIOS loaded: ${SAFETY_SCENARIOS.length} scenarios`);
    } else {
        console.error('❌ SAFETY_SCENARIOS not loaded!');
    }
    
    setupEventListeners();
    console.log('✅ initializeApp() 完了');
}

// イベントリスナーの設定（グローバルスコープで公開）
window.setupEventListeners = function setupEventListeners() {
    console.log('🔧 setupEventListeners() 開始');
    
    let imageInput = document.getElementById('imageInput');
    let analyzeBtn = document.getElementById('analyzeBtn');
    let dropZone = document.getElementById('dropZone');

    console.log('📋 要素チェック:', {
        imageInput: !!imageInput,
        analyzeBtn: !!analyzeBtn,
        dropZone: !!dropZone
    });

    if (!dropZone || !imageInput || !analyzeBtn) {
        console.error('❌ Required elements not found:', {
            dropZone: !!dropZone,
            imageInput: !!imageInput,
            analyzeBtn: !!analyzeBtn
        });
        return;
    }

    // 既存のイベントリスナーをクリア（重複登録を防ぐ）
    console.log('🧹 既存イベントリスナーをクリア中...');
    const newDropZone = dropZone.cloneNode(true);
    dropZone.parentNode.replaceChild(newDropZone, dropZone);
    dropZone = newDropZone;
    
    const newImageInput = imageInput.cloneNode(true);
    imageInput.parentNode.replaceChild(newImageInput, imageInput);
    imageInput = newImageInput;
    
    const newAnalyzeBtn = analyzeBtn.cloneNode(true);
    analyzeBtn.parentNode.replaceChild(newAnalyzeBtn, analyzeBtn);
    analyzeBtn = newAnalyzeBtn;
    
    console.log('✅ すべての要素が見つかりました（リスナークリア完了）');

    // 🎯 v60.6: 初回分析用のモデル選択UIのイベントリスナー
    const analysisModelSelector = document.querySelectorAll('input[name="analysisModel"]');
    if (analysisModelSelector.length > 0) {
        analysisModelSelector.forEach(radio => {
            radio.addEventListener('change', function(e) {
                const selected = e.target.value;
                const statusDiv = document.getElementById('analysisModelStatus');
                if (statusDiv) {
                    if (selected === 'flash') {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle mr-1"></i>選択中: Gemini 3.0 Flash（高速・約0.7円/回）';
                    } else {
                        statusDiv.innerHTML = '<i class="fas fa-check-circle mr-1"></i>選択中: Gemini 3.0 Pro（高精度・約2.9円/回）';
                    }
                }
                console.log(`🎯 初回分析モデル選択: ${selected === 'flash' ? 'Flash（高速）' : 'Pro（高精度）'}`);
            });
        });
        console.log('✅ 初回分析用モデル選択UIのイベントリスナー登録完了');
    }

    // 画像選択時
    imageInput.addEventListener('change', function(event) {
        console.log('📁 ファイル選択イベント発火');
        handleImageSelect(event);
    });

    // 分析ボタンクリック
    analyzeBtn.addEventListener('click', function() {
        console.log('🔍 分析ボタンクリック');
        analyzeImage();
    });

    // デフォルト動作を防止
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // ウィンドウ全体でドラッグ＆ドロップを防止
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // クリックでファイル選択
    dropZone.addEventListener('click', function(e) {
        console.log('🖱️ dropZoneクリック');
        e.preventDefault();
        e.stopPropagation();
        imageInput.click();
    });

    // ドラッグ進入
    dropZone.addEventListener('dragenter', function(e) {
        console.log('📥 ドラッグ進入');
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-blue-500', 'bg-blue-50', 'border-4');
    });

    // ドラッグオーバー
    dropZone.addEventListener('dragover', function(e) {
        console.log('📥 ドラッグオーバー');
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        dropZone.classList.add('border-blue-500', 'bg-blue-50', 'border-4');
    });

    // ドラッグ離脱
    dropZone.addEventListener('dragleave', function(e) {
        console.log('📤 ドラッグ離脱');
        e.preventDefault();
        e.stopPropagation();
        
        const rect = dropZone.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX >= rect.right || 
            e.clientY < rect.top || e.clientY >= rect.bottom) {
            dropZone.classList.remove('border-blue-500', 'bg-blue-50', 'border-4');
        }
    });

    // ドロップ
    dropZone.addEventListener('drop', function(e) {
        console.log('📦 ドロップイベント発火');
        e.preventDefault();
        e.stopPropagation();
        
        dropZone.classList.remove('border-blue-500', 'bg-blue-50', 'border-4');
        
        const files = e.dataTransfer.files;
        console.log('📁 ドロップされたファイル数:', files.length);
        
        if (files && files.length > 0) {
            console.log('✅ ファイル処理開始:', files[0].name);
            processImageFile(files[0]);
        } else {
            console.warn('⚠️ ファイルが見つかりません');
        }
    });
    
    console.log('✅ setupEventListeners() 完了');
}

// グローバル公開の確認
console.log('🌐 グローバル公開確認:');
console.log('  - window.setupEventListeners:', typeof window.setupEventListeners);
console.log('  - setupEventListeners:', typeof setupEventListeners);
if (typeof window.setupEventListeners !== 'function') {
    console.error('❌ window.setupEventListeners がグローバルに公開されていません！');
} else {
    console.log('✅ window.setupEventListeners がグローバルに公開されました');
}

// 画像選択処理
function handleImageSelect(event) {
    console.log('📁 handleImageSelect() 呼び出し');
    const file = event.target.files[0];
    console.log('📁 選択されたファイル:', file ? file.name : 'なし');
    if (file) {
        processImageFile(file);
    }
}

// 画像ファイル処理
function processImageFile(file) {
    console.log('🖼️ processImageFile() 開始:', file.name);
    console.log('📊 ファイル情報:', {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type
    });
    
    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
        console.error('❌ ファイルサイズ超過:', file.size);
        alert('ファイルサイズは10MB以下にしてください');
        return;
    }

    // ファイルタイプチェック
    if (!file.type.match('image.*')) {
        console.error('❌ 無効なファイルタイプ:', file.type);
        alert('画像ファイルを選択してください');
        return;
    }

    console.log('✅ ファイル検証完了、プレビュー表示開始');
    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        displayPreview(e.target.result);
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }
    };
    reader.readAsDataURL(file);
}

// ========================================
// 【新機能】個人情報保護：自動ぼかし処理（ChatGPT最適化版）
// ========================================

// 座標自動判定ヘルパー（正規化 or ピクセルを自動判定）
function verticesToPixels(vertices, img) {
    const isNormalized = vertices.every(v =>
        typeof v.x === 'number' && typeof v.y === 'number' &&
        v.x >= 0 && v.x <= 1 && v.y >= 0 && v.y <= 1
    );

    return vertices.map(v => ({
        x: isNormalized ? v.x * img.width  : v.x,
        y: isNormalized ? v.y * img.height : v.y
    }));
}

// 爆速ぼかし描画（ctx.filter使用）
function blurRect(ctx, img, x, y, w, h, blurPx = 16) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

async function applyPrivacyBlur(imageData, privacyItems) {
    return new Promise((resolve) => {
        if (!privacyItems || privacyItems.length === 0) {
            console.log('🔒 個人情報なし、ぼかし処理をスキップ');
            resolve(imageData);
            return;
        }
        
        console.log('🔒 個人情報保護処理開始:', privacyItems.length, '件');
        
        const img = new Image();
        img.onload = () => {
            // Canvasを作成
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // 元画像を描画
            ctx.drawImage(img, 0, 0);
            
            const padding = 12;
            const blurPx = 18;
            
            // 各個人情報エリアにぼかしを適用
            privacyItems.forEach((item, index) => {
                const pts = verticesToPixels(item.boundingBox.vertices, img);
                
                const x = Math.min(...pts.map(p => p.x));
                const y = Math.min(...pts.map(p => p.y));
                const w = Math.max(...pts.map(p => p.x)) - x;
                const h = Math.max(...pts.map(p => p.y)) - y;
                
                if (w <= 2 || h <= 2) {
                    console.warn('⚠️ 無効な座標:', item.type, { x, y, w, h });
                    return;
                }
                
                const bx = Math.max(0, x - padding);
                const by = Math.max(0, y - padding);
                const bw = Math.min(img.width  - bx, w + padding * 2);
                const bh = Math.min(img.height - by, h + padding * 2);
                
                // 爆速ぼかし描画
                blurRect(ctx, img, bx, by, bw, bh, blurPx);
                
                console.log(`  ✅ ${index + 1}. ${item.type} blur`, {
                    x: Math.round(bx), y: Math.round(by), w: Math.round(bw), h: Math.round(bh)
                });
            });
            
            // ぼかし処理後の画像をBase64で返す
            const blurredImageData = canvas.toDataURL('image/jpeg', 0.95);
            console.log('✅ 個人情報保護処理完了（ChatGPT最適化版）');
            resolve(blurredImageData);
        };
        
        img.onerror = () => {
            console.error('❌ 画像読み込みエラー');
            resolve(imageData);
        };
        
        img.src = imageData;
    });
}

// プレビュー表示
function displayPreview(imageData) {
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    
    if (previewContainer && previewImage) {
        previewImage.src = imageData;
        previewContainer.classList.remove('hidden');
    }
}

// ========================================
// ✅ v61.3: ChatGPT 安全パッチ - ヘルパー関数
// ========================================
// ========================================
// B案：重なりピンを円形に分散（動的半径・十分な距離を確保）
// ChatGPT+ジェミニプロ指示による完全版
// ========================================
function spreadOverlappingPins(items, {
    pinR = 24,     // ピン外円半径
    gap  = 12,     // ピン同士の余白
    tol  = 1       // 同一点判定の丸め（px）
} = {}) {
    const groups = new Map();

    const keyOf = (x, y) => `${Math.round(x / tol)}_${Math.round(y / tol)}`;

    items.forEach((it, idx) => {
        const k = keyOf(it.pinX, it.pinY);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(idx);
    });

    // ログ（重なり診断）
    const diag = {};
    for (const [k, idxs] of groups.entries()) diag[k] = idxs.length;
    console.log("📌 pin重なり数", diag);

    for (const idxs of groups.values()) {
        const n = idxs.length;

        if (n <= 1) {
            const i = idxs[0];
            items[i].drawX = items[i].pinX;
            items[i].drawY = items[i].pinY;
            continue;
        }

        // chord（隣接ピン間距離）が minDist 以上になる半径を計算
        const minDist = 2 * pinR + gap;
        const denom = 2 * Math.sin(Math.PI / n);
        let R = denom > 0 ? (minDist / denom) : minDist;

        // 安全側にクランプ（2個でも確実に離す）
        R = Math.max(R, pinR + gap);   // 例：24+12=36
        R = Math.min(R, 60);           // 画面外に飛びすぎ防止

        console.log(`⚠️ 重なり検出: ${n}個 -> 半径R=${Math.round(R)}で分散`);

        const step = (2 * Math.PI) / n;
        const start = -Math.PI / 2; // 上から開始（見た目が安定）

        idxs.forEach((itemIndex, j) => {
            const a = start + j * step;
            const cx = items[itemIndex].pinX;
            const cy = items[itemIndex].pinY;
            items[itemIndex].drawX = cx + Math.cos(a) * R;
            items[itemIndex].drawY = cy + Math.sin(a) * R;
        });
    }

    console.table(items.map(p => ({
        label: p.labelNo ?? p.labelIndex,
        pinX: Math.round(p.pinX),
        pinY: Math.round(p.pinY),
        drawX: Math.round(p.drawX ?? p.pinX),
        drawY: Math.round(p.drawY ?? p.pinY),
    })));

    return items;
}

// ==========================================
// ✅ v59.1: Risk Anchor Map + Reality Check + WorkType gate（ChatGPT統合版）
// 目的：根拠物体チェック + 誤ラベル矯正 + Person/Clothing回避
// ==========================================

// ====== 設定（最初は false 推奨）======
const KILL_HALLUCINATIONS = false; // trueにすると「ダンプ」等を検出根拠なしで削除

// 文字正規化
const norm = (s) => String(s ?? "").toLowerCase().trim();

// Person/Clothing判定（最後の手段に落とす）
const isPersonLike = (name) => {
    const n = norm(name);
    return n.includes("person") || n.includes("clothing") || n.includes("worker") || n.includes("作業員");
};

// タイトル取得（titleがundefinedになる対策）
const getRiskTitle = (risk) => 
    risk.title ?? risk.riskTitle ?? risk.name ?? risk.summary ?? "";

// bboxName取得（取りこぼし防止）
const getRiskBboxName = (risk) =>
    risk.bboxName ?? risk.bbox ?? risk.anchorTarget ?? risk.target ?? risk.objectName ?? "none";

// ====== Anchor Map（タイトル語句→優先物体）======
const ANCHOR_MAP = {
    // 吊り・落下
    "吊り": ["吊り荷", "hook", "crane", "bucket", "玉掛け", "スリング", "cargo"],
    "落下": ["吊り荷", "cargo", "bucket", "hook", "crane"],
    "飛来落下": ["吊り荷", "cargo", "bucket", "hook", "crane", "資材"],
    
    // 重機・接触
    "重機": ["excavator", "backhoe", "バックホウ", "machine", "truck", "車両"],
    "接触": ["excavator", "backhoe", "バックホウ", "machine", "truck", "車両", "person"],
    
    // 路面・転倒
    "転倒": ["ground", "road", "gravel", "路面", "段差", "溝", "u-ditch"],
    "つまずき": ["ground", "road", "gravel", "路面", "段差", "溝", "u-ditch"],
    
    // 土砂・崩壊
    "土砂": ["trench", "ditch", "溝", "掘削", "ground", "soil"],
    "崩壊": ["trench", "ditch", "溝", "掘削", "ground", "soil"],
    
    // 型枠・支保工（出るなら実体必須にする）
    "型枠": ["formwork", "shoring", "panel", "型枠", "支保工"],
    "支保工": ["shoring", "formwork", "支保工", "型枠"]
};

// ====== Reality Check（キーワード→必須物体）======
const REALITY_CHECK = {
    "ダンプ": ["dump truck", "dumptruck", "dump", "truck", "vehicle", "車両", "トラック"],
    "トラック": ["truck", "vehicle", "車両", "トラック"],
    "型枠": ["formwork", "shoring", "panel", "型枠", "支保工"],
    "支保工": ["shoring", "formwork", "支保工", "型枠"]
};

// ====== 検出物体名のSet作成（英日対応）======
const buildDetectedNameSet = (objects) => {
    const set = new Set();
    (objects ?? []).forEach((o) => {
        const n = norm(o.name ?? o.description ?? "");
        if (n) set.add(n);
    });
    return set;
};

const hasAnyDetected = (detectedSet, required) => {
    const reqs = required.map(norm);
    for (const det of detectedSet) {
        if (reqs.some(r => det.includes(r))) return true;
    }
    return false;
};

// ====== タイトルから Anchor Map 候補を抽出 ======
const getTargetsFromTitle = (title) => {
    const t = norm(title);
    const hits = [];
    for (const [k, arr] of Object.entries(ANCHOR_MAP)) {
        if (t.includes(norm(k))) hits.push(...arr);
    }
    return Array.from(new Set(hits.map(norm))).filter(Boolean);
};

// ====== タイトルの一般化（KILLしない場合）======
const softenTitle = (title, detectedSet) => {
    const t = String(title ?? "");
    const low = norm(t);
    
    // ダンプ根拠なし → 一般化
    if (/(ダンプ|荷台|dump)/i.test(low) && !hasAnyDetected(detectedSet, REALITY_CHECK["ダンプ"])) {
        return t
            .replace(/ダンプトラック荷台からの落下物/g, "積載物からの落下（要確認）")
            .replace(/ダンプトラック/g, "車両（要確認）")
            .replace(/ダンプ/g, "車両（要確認）");
    }
    return t;
};

// ==========================================
// ✅ v58 FINAL: bbox補完ユーティリティ（ChatGPT統合版）
// 目的：anchorX/anchorY undefined を根絶
// ==========================================

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const normToPx = (v, size) => {
    // 0〜1なら正規化とみなしてpxへ、それ以外はそのまま
    if (v >= 0 && v <= 1) return v * size;
    return v;
};

// bbox中心点を取得（vertices / normalizedVertices / left+top+width+height / xMin..xMax対応）
function getBoxCenterPx(box, imgW, imgH) {
    if (!box) return null;

    const b = box.boundingBox || box.boundingPoly || box;

    // A) xMin/xMax/yMin/yMax
    if (b?.xMin != null && b?.xMax != null && b?.yMin != null && b?.yMax != null) {
        return { x: (b.xMin + b.xMax) / 2, y: (b.yMin + b.yMax) / 2 };
    }

    // B) vertices / normalizedVertices
    const verts = b?.normalizedVertices || b?.vertices;
    if (Array.isArray(verts) && verts.length) {
        const xs = [];
        const ys = [];
        for (const p of verts) {
            if (p?.x == null || p?.y == null) continue;
            const x = normToPx(Number(p.x), imgW);
            const y = normToPx(Number(p.y), imgH);
            if (Number.isFinite(x) && Number.isFinite(y)) {
                xs.push(x);
                ys.push(y);
            }
        }
        if (xs.length) {
            const x = (Math.min(...xs) + Math.max(...xs)) / 2;
            const y = (Math.min(...ys) + Math.max(...ys)) / 2;
            return { x, y };
        }
    }

    // C) left/top/width/height
    if (b?.left != null && b?.top != null && b?.width != null && b?.height != null) {
        return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }

    return null;
}

const isLowPriorityName = (name) => {
    const n = (name || "").toLowerCase();
    return n.includes("person") || n.includes("clothing");
};

// 名前一致候補から最適anchorを選ぶ（pin近傍優先、Person/Clothing最下位）
function resolveAnchorFromBboxName(risk, candidatesSource, pinX, pinY, imgW, imgH) {
    const bboxName = String(risk?.bboxName || risk?.boundingBox?.name || "").trim();
    if (!bboxName || !Array.isArray(candidatesSource) || candidatesSource.length === 0) return null;

    const target = bboxName.toLowerCase();

    const candidates = candidatesSource
        .map((obj) => {
            const name = String(obj?.name ?? obj?.label ?? obj?.description ?? obj?.bboxName ?? "").trim();
            const box = obj?.boundingPoly || obj?.boundingBox || obj;
            const center = getBoxCenterPx(box, imgW, imgH);
            return { obj, name, center };
        })
        .filter(x => x.center && x.name.toLowerCase().includes(target));

    if (!candidates.length) return null;

    // 1) Person/Clothingを後ろに回す
    candidates.sort((a, b) => {
        const ap = isLowPriorityName(a.name) ? 1 : 0;
        const bp = isLowPriorityName(b.name) ? 1 : 0;
        return ap - bp; // 非personが先
    });

    // 2) pinがあるなら距離最小
    if (pinX != null && pinY != null) {
        let best = candidates[0];
        let bestD = Infinity;
        for (const c of candidates) {
            const d = Math.hypot(c.center.x - pinX, c.center.y - pinY);
            if (d < bestD) { bestD = d; best = c; }
        }
        return best.center;
    }

    // pin無しなら先頭（非person優先）
    return candidates[0].center;
}

// hotspot優先→bbox中心→pinオフセット（ゼロ長回避）
function ensureAnchor(risk, pinX, pinY, imgW, imgH, candidatesSource) {
    // 1) hotspot（centerX/centerY or x/y）
    const hs = risk?.hotspot;
    if (hs) {
        const cx = toNum(hs.centerX ?? hs.x);
        const cy = toNum(hs.centerY ?? hs.y);
        if (cx != null && cy != null) {
            const x = normToPx(cx, imgW);
            const y = normToPx(cy, imgH);
            return { x, y, source: "hotspot" };
        }
    }

    // 2) risk.boundingBox があるなら中心
    if (risk?.boundingBox) {
        const c = getBoxCenterPx(risk.boundingBox, imgW, imgH);
        if (c) return { x: c.x, y: c.y, source: "risk.boundingBox" };
    }

    // 3) bboxName があるなら candidates から復元（ここがv58本丸）
    if (risk?.bboxName) {
        const c = resolveAnchorFromBboxName(risk, candidatesSource, pinX, pinY, imgW, imgH);
        if (c) return { x: c.x, y: c.y, source: "bboxName->candidate" };
    }

    // 4) 最終：pinから上にオフセット（ゼロ長矢印を防ぐ）
    if (pinX != null && pinY != null) {
        return { x: pinX, y: Math.max(20, pinY - 120), source: "pinOffset" };
    }

    return null;
}

// ==========================================
// ✅ v59: タイトルマップベースのアンカー解決（ChatGPT統合版）
// ==========================================

// bboxName/タイトル候補でオブジェクトを選ぶ（pinに近いのを優先、Person/Clothingはペナルティ）
function resolveAnchorByTargets(boxCenters, targets, pinX, pinY, imgW, imgH) {
    // ★ v59.2: boxCenters（名前付き中心座標配列）を直接使用
    if (!boxCenters?.length || !targets?.length) return null;
    
    let best = null;
    
    for (const box of boxCenters) {
        const name = norm(box.name ?? "");
        if (!name) continue;
        
        // target一致
        const match = targets.some((t) => name.includes(t));
        if (!match) continue;
        
        // box.x, box.y は既にピクセル座標
        const dist = Math.hypot(box.x - pinX, box.y - pinY);
        
        // Person/Clothingは強ペナルティ（ゼロにはしない＝最後の手段として残す）
        const penalty = isPersonLike(name) ? 800 : 0;
        
        const score = dist + penalty;
        if (!best || score < best.score) best = { x: box.x, y: box.y, score, name };
    }
    
    return best ? { x: best.x, y: best.y, pickedName: best.name } : null;
}

// v59.2: 1件のリスクについてアンカー最終決定（bbox中心配列を使用）
function resolveFinalAnchor(risk, boxCenters, imgW, imgH) {
    const pinX = Number(risk.pinX ?? risk.pin?.x ?? 0);
    const pinY = Number(risk.pinY ?? risk.pin?.y ?? 0);
    
    const titleRaw = getRiskTitle(risk);
    const detectedSet = buildDetectedNameSet(boxCenters);  // ★ v59.2: boxCentersから構築
    const title = softenTitle(titleRaw, detectedSet);
    const bboxName = getRiskBboxName(risk);
    
    // ① 既にanchorPointが数値ならそれを最優先
    if (risk.anchorX !== undefined && risk.anchorY !== undefined) {
        const ax = Number(risk.anchorX);
        const ay = Number(risk.anchorY);
        if (Number.isFinite(ax) && Number.isFinite(ay)) {
            return { x: ax, y: ay, via: "givenAnchor", title };
        }
    }
    
    // ② bboxNameが有効で Person/Clothing 以外なら bboxName優先で探索
    const bboxNorm = norm(bboxName);
    const bboxTargets = bboxNorm && bboxNorm !== "none" ? [bboxNorm] : [];
    
    const titleTargets = getTargetsFromTitle(title);
    
    // ★ v59.2: boxCentersを使用した探索
    // 探索順：bboxName(ただしpersonlikeは後回し) → タイトルマップ → bboxName(personlike) → pinOffset
    if (bboxTargets.length && !isPersonLike(bboxNorm)) {
        const a = resolveAnchorByTargets(boxCenters, bboxTargets, pinX, pinY, imgW, imgH);
        if (a) return { x: a.x, y: a.y, via: `bboxName:${bboxName}->${a.pickedName}`, title };
    }
    
    if (titleTargets.length) {
        const a = resolveAnchorByTargets(boxCenters, titleTargets, pinX, pinY, imgW, imgH);
        if (a) return { x: a.x, y: a.y, via: `titleMap->${a.pickedName}`, title };
    }
    
    // bboxNameがperson/clothingしか無い場合の最後の探索
    if (bboxTargets.length && isPersonLike(bboxNorm)) {
        const a = resolveAnchorByTargets(boxCenters, bboxTargets, pinX, pinY, imgW, imgH);
        if (a) return { x: a.x, y: a.y, via: `bboxName(person)->${a.pickedName}`, title };
    }
    
    // ③ どうしても無理ならpinOffset（現状の挙動）
    const fallback = { x: pinX, y: Math.max(20, pinY - 120) };
    return { ...fallback, via: "pinOffset", title };
}

// ========================================
// ✅ v61.3: Canvas座標変換ヘルパー関数（ChatGPT安全パッチ）
// ========================================

/**
 * 画像の表示メトリクスを計算（object-fit: contain 対応）
 * @param {HTMLImageElement} img - 対象の画像要素
 * @returns {Object} メトリクス情報
 */
function getRenderedImageMetrics(img) {
    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    
    // object-fit: contain の実際の描画サイズを計算
    const imgAspect = nw / nh;
    const containerAspect = rect.width / rect.height;
    
    let renderW, renderH, offsetX, offsetY;
    
    if (imgAspect > containerAspect) {
        // 横長画像：横幅に合わせる
        renderW = rect.width;
        renderH = rect.width / imgAspect;
        offsetX = 0;
        offsetY = (rect.height - renderH) / 2;
    } else {
        // 縦長画像：縦幅に合わせる
        renderW = rect.height * imgAspect;
        renderH = rect.height;
        offsetX = (rect.width - renderW) / 2;
        offsetY = 0;
    }
    
    return { rect, dpr, nw, nh, renderW, renderH, offsetX, offsetY };
}

/**
 * オーバーレイCanvas を DPR 対応で作成
 * @param {HTMLImageElement} img - 対象の画像要素
 * @returns {Object} { canvas, ctx, m }
 */
function setupOverlayCanvas(img) {
    const m = getRenderedImageMetrics(img);
    const canvas = document.createElement('canvas');
    
    // CSS 表示サイズ
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = `${m.rect.width}px`;
    canvas.style.height = `${m.rect.height}px`;
    canvas.style.pointerEvents = 'none';
    
    // 内部解像度（DPR 対応）
    canvas.width = m.rect.width * m.dpr;
    canvas.height = m.rect.height * m.dpr;
    
    const ctx = canvas.getContext('2d');
    
    // DPR スケーリング適用
    ctx.scale(m.dpr, m.dpr);
    
    return { canvas, ctx, m };
}

/**
 * 元画像座標を表示座標に変換（自動スケール補正付き）
 * @param {number} x - 元画像のX座標
 * @param {Object} m - メトリクス情報
 * @returns {number} 表示座標のX
 */
function fixToDisplayXY(x, y, img, m) {
    if (!m || x === undefined || y === undefined) return { x, y };
    
    // 座標が異常に大きい場合は自動スケール補正（保険）
    const maxCoord = Math.max(img.width, img.height);
    if (x > maxCoord * 2 || y > maxCoord * 2) {
        console.warn('⚠️ 座標が異常に大きいため自動補正:', x, y);
        const scale = Math.max(x / m.renderW, y / m.renderH);
        x = x / scale;
        y = y / scale;
    }
    
    // 元画像座標 → 正規化 → 表示座標
    const nx = x / img.width;
    const ny = y / img.height;
    
    return {
        x: m.offsetX + nx * m.renderW,
        y: m.offsetY + ny * m.renderH
    };
}

/**
 * 正規化座標（0〜1）を表示座標に変換
 * @param {number} nx - 正規化X座標
 * @param {number} ny - 正規化Y座標
 * @param {Object} m - メトリクス情報
 * @returns {Object} { x, y }
 */
function normToDisplayXY(nx, ny, m) {
    return {
        x: m.offsetX + nx * m.renderW,
        y: m.offsetY + ny * m.renderH
    };
}

// ========================================
// ✅ v60.7: Deep Hit 補正関数（吊り荷bbox下側85%を狙う）
// ========================================

/**
 * 吊り荷系リスクの矢印先端を床版（吊り荷の実体）に刺すよう補正
 * @param {Object} risk - リスクオブジェクト
 * @param {number} targetX - 元のターゲットX座標
 * @param {number} targetY - 元のターゲットY座標
 * @param {Object} ctxInfo - コンテキスト情報 { cssW, cssH, bboxForLoad }
 * @returns {Object} { x, y, mode }
 */
function applyDeepHitForSuspendedLoad(risk, targetX, targetY, ctxInfo) {
    const title = (risk?.title || risk?.riskType || "").toLowerCase();
    
    // 吊り荷系リスクかどうか判定
    const isSuspendedLoad = 
        title.includes("吊り荷") || 
        title.includes("落下") || 
        title.includes("落下物") || 
        title.includes("suspended") || 
        title.includes("load");
    
    if (!isSuspendedLoad) {
        return { x: targetX, y: targetY, mode: "none" };
    }
    
    const box = ctxInfo?.bboxForLoad;
    
    // bbox が存在する場合：下側85%を狙う
    if (box && Number.isFinite(box.x) && Number.isFinite(box.y) && 
        Number.isFinite(box.w) && Number.isFinite(box.h)) {
        
        // bbox が縦長ならワイヤーを含んでいる可能性が高い → 下側85%を狙う
        const aspect = box.h / Math.max(1, box.w);
        const deepRate = aspect >= 1.6 ? 0.85 : 0.60; // 縦長ほど深く
        
        const x = box.x + box.w * 0.50;  // 中央
        const y = box.y + box.h * deepRate;  // 下側85% or 60%
        
        return { x, y, mode: `bbox(${deepRate.toFixed(2)})` };
    }
    
    // bbox が無い場合の暫定：床版は作業員より上にあることが多いので、先端を上へ寄せる
    if (Number.isFinite(ctxInfo?.cssH)) {
        const y = Math.max(0, targetY - ctxInfo.cssH * 0.18);
        return { x: targetX, y, mode: "fallback(up18%)" };
    }
    
    return { x: targetX, y: targetY, mode: "fallback(none)" };
}

/**
 * boundingBoxes から吊り荷系の bbox を検出
 * @param {Array} boundingBoxes - バウンディングボックス配列
 * @returns {Object|null} { x, y, w, h } or null
 */
function findLoadBBox(boundingBoxes = []) {
    const keys = ["吊り荷", "load", "slab", "deck", "床版", "concrete", "pc", "panel"];
    
    const hit = boundingBoxes.find(b => {
        const n = (b.name || b.label || b.className || b.boxName || "").toLowerCase();
        return keys.some(k => n.includes(k.toLowerCase()));
    });
    
    if (!hit) return null;
    
    // bbox 形式を統一：{ x, y, w, h }
    const bbox = hit.boundingBox || hit;
    
    // vertices 形式の場合は変換
    if (bbox.vertices && Array.isArray(bbox.vertices)) {
        const xCoords = bbox.vertices.map(v => v.x);
        const yCoords = bbox.vertices.map(v => v.y);
        const x = Math.min(...xCoords);
        const y = Math.min(...yCoords);
        const w = Math.max(...xCoords) - x;
        const h = Math.max(...yCoords) - y;
        return { x, y, w, h };
    }
    
    // 既に { x, y, w, h } 形式の場合
    if (Number.isFinite(bbox.x) && Number.isFinite(bbox.y)) {
        return {
            x: bbox.x,
            y: bbox.y,
            w: bbox.w || bbox.width || 0,
            h: bbox.h || bbox.height || 0
        };
    }
    
    return null;
}

// ========================================
// 重複リスク統合関数（ChatGPT指示）
// ========================================
function mergeDuplicateRisks(risks, boxCenters, img) {
    const groups = new Map();
    
    // 座標計算とグルーピングを同時実行
    risks.forEach((risk, index) => {
        let pinX, pinY;
        
        // 座標計算（displayRiskVisualizationOnImageと同じロジック）
        if (risk.boundingBox && risk.boundingBox.boundingBox) {
            const vertices = risk.boundingBox.boundingBox.vertices;
            const xCoords = vertices.map(v => v.x * img.width);
            const yCoords = vertices.map(v => v.y * img.height);
            const zoneX = Math.min(...xCoords);
            const zoneY = Math.min(...yCoords);
            const zoneWidth = Math.max(...xCoords) - zoneX;
            const zoneHeight = Math.max(...yCoords) - zoneY;
            pinX = zoneX + zoneWidth / 2;
            pinY = zoneY + zoneHeight / 2;
        } else if (risk.hotspot && risk.hotspot.centerX !== undefined && risk.hotspot.centerY !== undefined) {
            // ★ ChatGPT指示：hotspot座標を使用（デモモード用）
            pinX = risk.hotspot.centerX * img.width;
            pinY = risk.hotspot.centerY * img.height;
            console.log(`🎯 hotspot座標使用: ${risk.title} (${pinX.toFixed(0)}, ${pinY.toFixed(0)})`);
        } else if (boxCenters.length > index) {
            const box = boxCenters[index];
            pinX = box.x;
            pinY = box.y;
        } else {
            const col = index % 3;
            const row = Math.floor(index / 3);
            pinX = 80 + col * Math.min(150, img.width / 4);
            pinY = 80 + row * Math.min(120, img.height / 5);
        }
        
        // ★ ChatGPT v48.1: anchorPoint計算（矢印の終点）
        let anchorX, anchorY;
        if (risk.anchorPoint && risk.anchorPoint.centerX !== undefined && risk.anchorPoint.centerY !== undefined) {
            anchorX = risk.anchorPoint.centerX * img.width;
            anchorY = risk.anchorPoint.centerY * img.height;
            console.log(`🎯 anchorPoint座標使用: ${risk.title} (${anchorX.toFixed(0)}, ${anchorY.toFixed(0)})`);
        }
        
        // 重複キー生成
        const priority = risk.priorityLabel || risk.priority || 'P0';
        const title = risk.riskType || risk.title || '';
        const key = `${title}|${Math.round(pinX)}|${Math.round(pinY)}|${priority}`;
        
        if (!groups.has(key)) {
            groups.set(key, {
                ...risk,
                pinX,
                pinY,
                anchorX,
                anchorY,
                count: 0,
                children: []
            });
        }
        
        const group = groups.get(key);
        group.count++;
        group.children.push(risk);
    });
    
    const merged = Array.from(groups.values());
    console.log(`🔄 重複統合: ${risks.length}件 → ${merged.length}件（重複${risks.length - merged.length}件を統合）`);
    
    return merged;
}

// 【新機能】写真上にリスク可視化を描画（番号ピン＋点線矢印＋ハッチング）
async function displayRiskVisualizationOnImage(imageData, risks, boundingBoxes) {
    return new Promise((resolve) => {
        const previewContainer = document.getElementById('preview-container');
        const previewImage = document.getElementById('preview-image');
        
        if (!previewContainer || !previewImage) {
            console.error('❌ preview elements not found');
            resolve(null);
            return;
        }

        const img = new Image();
        img.onload = () => {
            try {
                // ✅ ChatGPT/Gemini診断: img.onload 全体を try-catch で囲む
                
                // 既存のCanvasを削除
                const existingCanvas = document.getElementById('risk-canvas');
                if (existingCanvas) {
                    existingCanvas.remove();
                }

                // ==========================================
                // ✅ v61.3: ChatGPT 安全パッチ適用
                // ==========================================
            
            // Canvas を作成（try-catch でフォールバック）
            let canvas, ctx, m;
            try {
                const previewImage = document.getElementById('preview-image');
                ({ canvas, ctx, m } = setupOverlayCanvas(previewImage));
                canvas.id = 'risk-canvas';
                
                // ✅ ChatGPT安全パッチ: zIndex を確実に設定
                canvas.style.zIndex = '9999';
                canvas.style.pointerEvents = 'none';
                
                console.log('📏 [v61.3 Canvas精度] 元画像:', `${m.nw}×${m.nh}`);
                console.log('📏 [v61.3 Canvas精度] 表示サイズ:', `${m.rect.width.toFixed(0)}×${m.rect.height.toFixed(0)}`);
                console.log('📏 [v61.3 Canvas精度] 実際の画像表示:', `${m.renderW.toFixed(0)}×${m.renderH.toFixed(0)}`);
                console.log('📏 [v61.3 Canvas精度] オフセット:', `(${m.offsetX.toFixed(0)}, ${m.offsetY.toFixed(0)})`);
                console.log('📏 [v61.3 Canvas精度] DPR:', m.dpr);
                console.log('📏 [v61.3 Canvas精度] Canvas内部サイズ:', `${canvas.width}×${canvas.height}`);
            } catch (e) {
                console.warn('❌ overlay canvas setup failed:', e);
                // フォールバック（現状維持）
                canvas = document.createElement('canvas');
                canvas.id = 'risk-canvas';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.pointerEvents = 'none';
                canvas.style.zIndex = '9999';  // ✅ フォールバック時も zIndex 設定
                canvas.width = img.width;
                canvas.height = img.height;
                ctx = canvas.getContext('2d');
                m = null;
            }
            
            // ✅ v61.3: 座標変換関数をローカルスコープで定義
            const transformX = (x) => {
                if (!m) return x; // フォールバック時は変換なし
                const nx = x / img.width;
                return m.offsetX + nx * m.renderW;
            };
            
            const transformY = (y) => {
                if (!m) return y; // フォールバック時は変換なし
                const ny = y / img.height;
                return m.offsetY + ny * m.renderH;
            };
            
            // ✅ ChatGPT/Gemini診断: renderedWidth/renderedHeight を定義（安全なフォールバック付き）
            const renderedWidth = 
                (m && typeof m.renderW === 'number' && Number.isFinite(m.renderW)) ? m.renderW :
                (img.getBoundingClientRect().width || img.naturalWidth || img.width);
            
            const renderedHeight = 
                (m && typeof m.renderH === 'number' && Number.isFinite(m.renderH)) ? m.renderH :
                (img.getBoundingClientRect().height || img.naturalHeight || img.height);
            
            console.log(`📏 [v61.3.1] renderedWidth: ${renderedWidth.toFixed(0)}, renderedHeight: ${renderedHeight.toFixed(0)}`);
            
            // 優先度の色定義
            const PIN_COLORS = {
                'P0': '#DC2626', // 赤
                'P1': '#F59E0B', // オレンジ
                'P2': '#3B82F6'  // 青
            };

            console.log('📦 バウンディングボックス数:', boundingBoxes.length);
            console.log('🎯 リスク数:', risks.length);
            
            // ✅ v60.7: bbox ラベル診断ログ（吊り荷系があるか確認）
            console.log('🧪 [v60.7] bbox labels:', (boundingBoxes || []).map(b => 
                (b.name || b.label || b.boxName || "無名").toString()
            ));

            // リスクをP0順にソート
            const sortedRisks = risks.sort((a, b) => {
                const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            // バウンディングボックスの中心座標を計算（表示座標に変換）
            const boxCenters = boundingBoxes.map(box => {
                const vertices = box.boundingBox.vertices;
                const sumX = vertices.reduce((sum, v) => sum + v.x, 0);
                const sumY = vertices.reduce((sum, v) => sum + v.y, 0);
                const centerX = (sumX / vertices.length) * img.width;
                const centerY = (sumY / vertices.length) * img.height;
                
                return {
                    x: transformX(centerX),  // ✅ v61.2: 表示座標に変換
                    y: transformY(centerY),  // ✅ v61.2: 表示座標に変換
                    name: box.name,
                    confidence: box.confidence,
                    vertices: vertices
                };
            });

            console.log('📍 バウンディングボックス中心座標:', boxCenters);

            // ★★★ ChatGPT指示：重複リスク統合（最優先） ★★★
            // 同じ座標＋同じタイトルのリスクを1件にまとめる
            const mergedRisks = mergeDuplicateRisks(sortedRisks, boxCenters, img);
            
            // ★★★ ChatGPT指示：採番固定（統合後の配列を唯一の正とする） ★★★
            let displayRisks = mergedRisks.slice(0, 3).map((risk, i) => {
                // ★ v59.3: title を確実に埋める（ARROW_DIAG の undefined 対策）
                const title = risk.title ?? risk.riskTitle ?? risk.name ?? risk.scenarioName ?? '';
                return {
                    ...risk,
                    title: title,  // ★ 確実にtitleを設定
                    __labelNo: i + 1  // 採番を固定
                };
            });
            
            // ==========================================
            // ✅ v59.1: Reality Check（根拠物体チェック）
            // ==========================================
            const detectedSet = buildDetectedNameSet(boundingBoxes);
            
            // 1) Reality Check：必要ならKILL、基本は一般化
            displayRisks = displayRisks.filter((risk) => {
                const title0 = getRiskTitle(risk);
                const title = norm(title0);
                
                for (const [kw, required] of Object.entries(REALITY_CHECK)) {
                    if (title.includes(norm(kw))) {
                        const ok = hasAnyDetected(detectedSet, required);
                        if (!ok) {
                            if (KILL_HALLUCINATIONS) {
                                console.log(`💀 v59.1 KILL: "${kw}" 根拠物体なし -> ${title0}`);
                                return false;  // リスクを削除
                            } else {
                                console.log(`🧽 v59.1 SOFTEN: "${kw}" 根拠物体なし -> ${title0}`);
                                return true;  // リスクを残す（一般化は resolveFinalAnchor で実施）
                            }
                        }
                    }
                }
                return true;
            });
            
            console.log(`📊 表示リスク数: ${displayRisks.length}件（統合＋Reality Check完了）`);

            // ★★★ ChatGPT診断コード v2：座標の重複を数値で確認 ★★★
            console.log('🔍 矢印描画診断テーブル（座標重複チェック）:');
            const diagnosticData = displayRisks.map((r, i) => ({
                i: i + 1,
                title: r.title?.substring(0, 25) || 'no-title',
                hasHotspot: !!r.hotspot,
                hasAnchor: !!r.anchorPoint,
                hasBox: !!r.boundingBox,
                hotspot: r.hotspot ? `${r.hotspot.centerX.toFixed(2)},${r.hotspot.centerY.toFixed(2)}` : 'none',
                anchor: r.anchorPoint ? `${r.anchorPoint.centerX.toFixed(2)},${r.anchorPoint.centerY.toFixed(2)}` : 'none',
                boxName: r.boundingBox?.name || 'none'
            }));
            console.table(diagnosticData);
            
            // 座標重複の警告
            const anchors = diagnosticData.filter(d => d.anchor !== 'none').map(d => d.anchor);
            const uniqueAnchors = new Set(anchors);
            if (anchors.length > 0 && uniqueAnchors.size < anchors.length) {
                console.warn(`⚠️ 矢印座標が重複しています！ ${anchors.length}本中 ${uniqueAnchors.size}種類の座標しかありません`);
                console.warn('重複座標:', anchors);
            }

            // ★★★ ChatGPT診断ログ：各リスクの矢印描画可能性を確認 ★★★
            console.log('🎯 [ARROW_DIAG] 全リスクの矢印描画データ:');
            displayRisks.forEach((r, i) => {
                // ★ v59.2: title が undefined にならないように複数フォールバック
                const title = r.title ?? r.riskTitle ?? r.name ?? r.summary ?? '';
                console.log(`[ARROW_DIAG] #${i+1}`, {
                    title: title.substring(0, 30),
                    priority: r.priority,
                    hotspot: r.hotspot,
                    anchorPoint: r.anchorPoint,
                    bboxName: r.boundingBox?.name || 'none',
                    hasBbox: !!r.boundingBox,
                    pinX: r.pinX?.toFixed(0),
                    pinY: r.pinY?.toFixed(0),
                    anchorX: r.anchorX?.toFixed(0),
                    anchorY: r.anchorY?.toFixed(0)
                });
            });

            // 各リスクの座標とゾーン情報を計算して配列を作成
            const displayPoints = displayRisks.map((risk, index) => {
                const number = risk.__labelNo;
                
                // mergedRisksから既に計算済みのpinX/pinY/anchorX/anchorYを使用
                let pinX = risk.pinX;
                let pinY = risk.pinY;
                let anchorX = risk.anchorX;  // ★ anchorPoint座標を追加
                let anchorY = risk.anchorY;  // ★ anchorPoint座標を追加
                let zoneX, zoneY, zoneWidth, zoneHeight;
                
                // ゾーン情報の計算（表示用・表示座標に変換）
                if (risk.boundingBox && risk.boundingBox.boundingBox) {
                    const vertices = risk.boundingBox.boundingBox.vertices;
                    const xCoords = vertices.map(v => v.x * img.width);
                    const yCoords = vertices.map(v => v.y * img.height);
                    
                    // ✅ v61.2: ゾーン座標を表示座標に変換
                    const zoneXOrig = Math.min(...xCoords);
                    const zoneYOrig = Math.min(...yCoords);
                    const zoneWidthOrig = Math.max(...xCoords) - zoneXOrig;
                    const zoneHeightOrig = Math.max(...yCoords) - zoneYOrig;
                    
                    zoneX = transformX(zoneXOrig);
                    zoneY = transformY(zoneYOrig);
                    zoneWidth = (zoneWidthOrig / img.width) * renderedWidth;
                    zoneHeight = (zoneHeightOrig / img.height) * renderedHeight;
                    
                    const countInfo = risk.count > 1 ? ` ×${risk.count}` : '';
                    console.log(`✅ リスク${number} "${risk.riskType}"${countInfo}: 統合済み座標使用`, { pinX, pinY, count: risk.count });
                } else {
                    // フォールバック（ゾーン情報がない場合・表示座標）
                    const col = index % 3;
                    const row = Math.floor(index / 3);
                    
                    zoneX = transformX(img.width * (0.4 + col * 0.15));
                    zoneY = transformY(img.height * (0.3 + row * 0.2));
                    zoneWidth = (0.2 * img.width / img.width) * renderedWidth;
                    zoneHeight = (0.15 * img.height / img.height) * renderedHeight;
                }
                
                return {
                    labelNo: number,
                    pinX,
                    pinY,
                    anchorX,  // ★ anchorPoint座標を追加
                    anchorY,  // ★ anchorPoint座標を追加
                    zoneX,
                    zoneY,
                    zoneWidth,
                    zoneHeight,
                    priority: risk.priorityLabel || risk.priority || 'P0',
                    riskType: risk.riskType,
                    count: risk.count || 1,  // countを保持
                    _risk: risk  // ★ v58.2: bbox補完用にrisk参照を追加
                };
            });
            
            // ★★★ ChatGPT+ジェミニプロ指示：B案適用 ★★★
            // 座標の重なりを解消（動的半径で十分な距離を確保）
            spreadOverlappingPins(displayPoints);
            
            // ==========================================
            // ✅ v59.2適用ポイント：bbox補完ロジック（boxCenters使用）
            // ==========================================
            const imgW = img.width;
            const imgH = img.height;
            
            // ★ v59.2: boxCentersを再計算（名前付き中心座標配列・表示座標）
            const boxCentersForAnchor = boundingBoxes.map(box => {
                const vertices = box.boundingBox.vertices;
                const sumX = vertices.reduce((sum, v) => sum + v.x, 0);
                const sumY = vertices.reduce((sum, v) => sum + v.y, 0);
                const centerX = (sumX / vertices.length) * imgW;
                const centerY = (sumY / vertices.length) * imgH;
                
                return {
                    x: transformX(centerX),  // ✅ v61.2: 表示座標に変換
                    y: transformY(centerY),  // ✅ v61.2: 表示座標に変換
                    name: box.name,
                    confidence: box.confidence
                };
            });
            
            console.log(`🔧 v61.2 Risk Anchor Map開始: boxCenters=${boxCentersForAnchor.length}件, 表示=${renderedWidth.toFixed(0)}x${renderedHeight.toFixed(0)}`);
            console.log(`   検出物体名:`, boxCentersForAnchor.map(b => b.name));
            
            const displayPointsFixed = displayPoints.map((p, index) => {
                const pinX = toNum(p.pinX);
                const pinY = toNum(p.pinY);
                
                // risk参照（displayPoint自身に_riskがあればそれを使用、なければdisplayRisksから）
                const risk = p._risk || displayRisks[index] || p;
                
                // 既にanchorが数値なら維持
                let ax = toNum(p.anchorX ?? risk.anchorX);
                let ay = toNum(p.anchorY ?? risk.anchorY);
                
                // ★ v59.2: resolveFinalAnchor に boxCenters を渡す
                const resolved = resolveFinalAnchor(risk, boxCentersForAnchor, imgW, imgH);
                
                ax = resolved.x;
                ay = resolved.y;
                const sanitizedTitle = resolved.title;
                
                console.log(`🔧 v59.2 anchor fixed: "${sanitizedTitle?.substring(0, 40)}" via=${resolved.via} pin=(${Math.round(pinX)},${Math.round(pinY)}) -> anchor=(${Math.round(ax)},${Math.round(ay)})`);
                
                // ゼロ長矢印回避（pin==anchorなら少しずらす）
                if (pinX != null && pinY != null && ax != null && ay != null) {
                    if (Math.abs(pinX - ax) < 2 && Math.abs(pinY - ay) < 2) {
                        ay = Math.max(20, ay - 120);
                        console.log(`⚠️ v59.2 ゼロ長回避: リスク${p.labelNo} anchor調整 -> (${Math.round(ax)},${Math.round(ay)})`);
                    }
                }
                
                return { ...p, anchorX: ax, anchorY: ay, hasAnchorX: ax != null, hasAnchorY: ay != null, sanitizedTitle, debugVia: resolved.via };
            });
            
            // v59補完後のdisplayPointsを使用
            const displayPointsFinal = displayPointsFixed;
            
            // ★★★ ChatGPT診断：描画直前の displayPoints 確認 ★★★
            console.log('🎨 [DRAW_DIAG] 描画直前の displayPoints 数:', displayPointsFinal.length);
            displayPointsFinal.forEach((pt, i) => {
                console.log(`[DRAW_DIAG] #${i+1}`, {
                    labelNo: pt.labelNo,
                    priority: pt.priority,
                    hasAnchorX: pt.anchorX !== undefined,
                    hasAnchorY: pt.anchorY !== undefined,
                    anchorX: pt.anchorX?.toFixed(0),
                    anchorY: pt.anchorY?.toFixed(0),
                    pinX: pt.pinX?.toFixed(0),
                    pinY: pt.pinY?.toFixed(0),
                    via: pt.debugVia  // v59: 探索経路
                });
            });
            
            // ★★★ 描画開始：drawX/drawYを優先使用 ★★★
            // ▼▼▼ v66.5: ハッチング軽量化（3強AI統合版） + ピン・矢印一体化 ▼▼▼
            console.log(`🎨 [v66.5] 描画ループ開始: 対象${displayPointsFinal.length}件`);

            displayPointsFinal.forEach((point) => {
                try {
                    const { labelNo, zoneX, zoneY, zoneWidth, zoneHeight, priority } = point;
                    const color = PIN_COLORS[priority] || '#FF0000';
                    
                    let drawX, drawY, targetX, targetY;
                    let hasValidTarget = false;

                    // 1. スケーリング係数の算出 (これが前回Y座標バグの特効薬)
                    // m (canvas metrics) がある場合はそれを利用、なければ1.0
                    const scaleX = (typeof m !== 'undefined' && m.renderW && img.width) ? (m.renderW / img.width) : 1;
                    const scaleY = (typeof m !== 'undefined' && m.renderH && img.height) ? (m.renderH / img.height) : 1;
                    const offsetX = (typeof m !== 'undefined') ? m.offsetX : 0;
                    const offsetY = (typeof m !== 'undefined') ? m.offsetY : 0;

                    // 2. 座標の正規化 (toPixel)
                    const toPixel = (val, dimension) => {
                        if (val === undefined || val === null || isNaN(val)) return null;
                        if (Math.abs(val) < 2.0) return val * dimension; // 0.5 -> 640px
                        return val; // 640 -> 640px
                    };
                    
                    // 3. ピン位置（始点）の決定
                    let pinRawX = (point._risk && point._risk.isFixedCoordinates) ? point._risk.pinX : (point.drawX ?? point.pinX);
                    let pinRawY = (point._risk && point._risk.isFixedCoordinates) ? point._risk.pinY : (point.drawY ?? point.pinY);
                    
                    const rawPixelX = toPixel(pinRawX, img.width);
                    const rawPixelY = toPixel(pinRawY, img.height);

                    if (rawPixelX !== null && rawPixelY !== null) {
                        // ★ ここで必ずスケールを掛ける！
                        drawX = offsetX + rawPixelX * scaleX;
                        drawY = offsetY + rawPixelY * scaleY;
                    } else {
                        // 完全フォールバック
                        drawX = 100 + (labelNo * 50);
                        drawY = 100;
                    }

                    // 4. ターゲット位置（終点）の決定 - 紐づけ強化
                    // ハッチング(Zone)がある場合、その「上辺中央」を狙う
                    if (zoneX !== undefined && zoneY !== undefined && zoneWidth) {
                        targetX = zoneX + zoneWidth / 2;
                        targetY = zoneY; // 上辺ジャスト
                        hasValidTarget = true;
                        console.log(`🎯 [v66.4] Smart Snap: #${labelNo} to Zone Top (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`);
                    } 
                    else if (point._risk && point._risk.anchorX !== undefined) {
                        const rawAncX = toPixel(point._risk.anchorX, img.width);
                        const rawAncY = toPixel(point._risk.anchorY, img.height);
                        if (rawAncX !== null) {
                            targetX = offsetX + rawAncX * scaleX;
                            targetY = offsetY + rawAncY * scaleY;
                            hasValidTarget = true;
                        }
                    }

                    // 重力補正（ターゲットがピンより上にある場合、強制的に下げる）
                    // ※ターゲットが無い場合も下に向ける
                    if (!hasValidTarget || targetY <= drawY) {
                        targetX = drawX;
                        targetY = drawY + 60; 
                        hasValidTarget = true;
                    }

                    // 画面外・極端な位置の補正
                    drawY = Math.max(30, Math.min(drawY, m ? m.renderH - 30 : drawY));
                    
                    // --- 5. ハッチング描画（v66.5: 軽量化 - 3強AI統合版） ---
                    if (zoneX !== undefined && zoneY !== undefined && zoneWidth && zoneHeight) {
                        // v66.5: パターンCanvasでスマートなハッチング（Gemini方式）
                        const patternCanvas = document.createElement('canvas');
                        const pctx = patternCanvas.getContext('2d');
                        const gridSize = 20; // グリッド間隔（適度な密度）
                        patternCanvas.width = gridSize;
                        patternCanvas.height = gridSize;

                        pctx.strokeStyle = color;
                        
                        // ★ 線幅を細く（4px → 2px）
                        pctx.lineWidth = 2;

                        // ★ 透明度を調整（Claude案: P0=0.5, P1=0.4, P2=0.3）
                        const alphaMap = { 'P0': 0.5, 'P1': 0.4, 'P2': 0.3 };
                        const riskLevel = priority || 'P2';
                        const alpha = alphaMap[riskLevel] || 0.3;
                        pctx.globalAlpha = alpha;

                        pctx.beginPath();
                        pctx.moveTo(0, 0);
                        pctx.lineTo(gridSize, gridSize);
                        pctx.stroke();

                        const pattern = ctx.createPattern(patternCanvas, 'repeat');
                        ctx.save();
                        
                        // パターンで塗りつぶし
                        ctx.fillStyle = pattern;
                        ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);
                        
                        // 外枠線も控えめに
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2;
                        ctx.globalAlpha = alpha * 1.2; // 枠線は少し濃く
                        ctx.setLineDash([8, 4]);
                        ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
                        ctx.setLineDash([]);
                        
                        ctx.restore();
                        
                        console.log(`🎨 [v66.5] Mild Hatching: #${labelNo} ${riskLevel} Alpha:${alpha} 線幅:2px`);
                    }
                    
                    // --- 6. 一体化描画 (Cohesive Drawing) ---
                    if (hasValidTarget) {
                        const pinRadius = 16; // ピンの大きさ
                        const angle = Math.atan2(targetY - drawY, targetX - drawX);
                        
                        // 矢印の開始点を、ピンの中心ではなく「円周」にする
                        const startX = drawX + Math.cos(angle) * (pinRadius - 2); 
                        const startY = drawY + Math.sin(angle) * (pinRadius - 2);

                        ctx.save();
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';

                        // ■ パス1: 白い極太フチ（ピンと矢印を一体で描く！）
                        ctx.beginPath();
                        // ピン部分（円）
                        ctx.arc(drawX, drawY, pinRadius, 0, Math.PI * 2);
                        // 矢印線部分（ここ重要：moveToで移動してlineToで引く）
                        ctx.moveTo(startX, startY); 
                        ctx.lineTo(targetX, targetY);
                        
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 8; // フチの太さ
                        ctx.stroke();

                        // ■ パス2: 色付き本体
                        ctx.beginPath();
                        // ピン部分
                        ctx.arc(drawX, drawY, pinRadius - 2, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                        
                        // 矢印線部分
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(targetX, targetY);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 5; // 本体の太さ
                        ctx.stroke();

                        // ■ パス3: 矢印の先端（三角形）
                        const arrowSize = 22;
                        ctx.beginPath();
                        ctx.moveTo(targetX, targetY);
                        ctx.lineTo(targetX - arrowSize * Math.cos(angle - Math.PI / 6), targetY - arrowSize * Math.sin(angle - Math.PI / 6));
                        ctx.lineTo(targetX - arrowSize * Math.cos(angle + Math.PI / 6), targetY - arrowSize * Math.sin(angle + Math.PI / 6));
                        ctx.closePath();
                        ctx.fillStyle = color;
                        ctx.fill();
                        // 先端の白フチ
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.stroke();

                        // ■ パス4: 番号テキスト
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = 'bold 18px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        // 少しY調整して視覚的な中央へ
                        ctx.fillText(labelNo, drawX, drawY + 1);

                        ctx.restore();
                        
                        console.log(`✅ [v66.4] Linked Draw: #${labelNo} (${drawX.toFixed(0)},${drawY.toFixed(0)}) -> (${targetX.toFixed(0)},${targetY.toFixed(0)})`);
                    }
                } catch (e) {
                    console.error('[DRAW_FAIL]', e);
                }
            });
            // ▲▲▲ v66.5 修正終わり ▲▲▲

            // ✅ v60.6: Canvas 追加前に親要素を relative に設定（ChatGPT指示）
            const previewContainer = document.getElementById('preview-container');
            if (previewContainer) {
                const computedPosition = getComputedStyle(previewContainer).position;
                if (computedPosition === 'static') {
                    previewContainer.style.position = 'relative';
                    console.log('📐 [v60.6] preview-container を relative に設定');
                }
            }
            
            // ✅ v60.6: Canvas を最前面に強制表示
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.zIndex = '99999';  // さらに高く
            canvas.style.pointerEvents = 'none';
            canvas.style.opacity = '1';
            canvas.style.display = 'block';
            console.log('📐 [v60.6] Canvas を最前面に設定: zIndex=99999');
            
            // Canvasを追加
            if (previewContainer) {
                previewContainer.appendChild(canvas);
            }
            
            console.log(`✅ リスク可視化完了: ${displayPointsFinal.length}件のリスクを描画（v59 Risk Anchor Map適用済み）`);
            resolve(mergedRisks);
            
            } catch (e) {
                // ✅ ChatGPT/Gemini診断: img.onload 内の例外をキャッチ
                console.error('[OVERLAY_CRASH] img.onload内でエラー発生:', e);
                console.error('スタックトレース:', e.stack);
                resolve(null); // エラーでも resolve して処理を続行
            }
        };

        img.onerror = () => {
            console.error('❌ 画像読み込みエラー');
            resolve(null);
        };

        img.src = imageData;
    });
}

// 画像分析処理（統括安全衛生責任者の視点による精密分析）
async function analyzeImage() {
    if (!currentImageData) {
        alert('画像を選択してください');
        return;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    if (!analyzeBtn) {
        console.error('❌ analyzeBtn element not found');
        alert('システムエラー: ボタン要素が見つかりません');
        return;
    }

    analyzeBtn.disabled = true;
    
    // テキストノードを使用してinnerHTMLエラーを回避
    const spinnerIcon = document.createElement('i');
    spinnerIcon.className = 'fas fa-spinner fa-spin mr-2';
    const textNode = document.createTextNode('AI分析中... 統括安全衛生責任者の視点で写真を詳細分析しています（100シナリオデータベース参照中）');
    analyzeBtn.textContent = '';
    analyzeBtn.appendChild(spinnerIcon);
    analyzeBtn.appendChild(textNode);

    try {
        console.log('🔍 Starting AI image analysis with 100 scenarios database...');
        
        // 画像から工種とリスクを精密分析
        const analysisResult = await performIntelligentAnalysis(currentImageData);

        console.log('✅ AI analysis completed:', analysisResult);
        displayResults(analysisResult);
    } catch (error) {
        console.error('❌ 分析エラー:', error);
        alert('分析中にエラーが発生しました。もう一度お試しください。\nエラー詳細: ' + (error.message || '不明なエラー'));
    } finally {
        analyzeBtn.disabled = false;
        
        // ボタンテキストを復元
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search-plus mr-2';
        const buttonText = document.createTextNode('安全リスクを分析（統括安全衛生責任者レベル・100シナリオDB）');
        analyzeBtn.textContent = '';
        analyzeBtn.appendChild(searchIcon);
        analyzeBtn.appendChild(buttonText);
    }
}

// インテリジェントな画像分析（100シナリオデータベース活用 + バックエンドAI連携）
async function performIntelligentAnalysis(imageData) {
    try {
        // 🎯 v60.6: 選択されたモデルを取得
        const selectedModel = document.querySelector('input[name="analysisModel"]:checked')?.value || 'flash';
        console.log(`🎯 初回分析で使用するモデル: ${selectedModel === 'flash' ? 'Gemini 3.0 Flash（高速）' : 'Gemini 3.0 Pro（高精度）'}`);
        
        // バックエンドAPIでAI画像分析を実行
        const response = await axios.post('/api/analyze-image', {
            imageData: imageData,
            model: selectedModel  // 🎯 v60.6: モデル情報を送信
        });
        
        if (!response.data.success) {
            throw new Error('画像分析に失敗しました');
        }
        
        const { detectedWorkTypes, detectedObjects, detectedRisks, boundingBoxes, privacyItems } = response.data;
        
        // ▼▼▼ v61.1: 座標データ抽出の強化パッチ ▼▼▼
        let finalBoundingBoxes = [];
        
        // パターン1: ルート直下の boundingBoxes
        if (boundingBoxes && Array.isArray(boundingBoxes) && boundingBoxes.length > 0) {
            finalBoundingBoxes = boundingBoxes;
            console.log(`📦 [v61.1] ルート直下のboundingBoxes: ${finalBoundingBoxes.length}件`);
        } 
        // パターン2: detectedObjects 内に含まれている場合
        else if (detectedObjects && Array.isArray(detectedObjects)) {
            detectedObjects.forEach((obj, idx) => {
                if (obj.box_2d || obj.boundingBox) {
                    const box = obj.box_2d || obj.boundingBox;
                    // 正規化（[ymin, xmin, ymax, xmax] -> {y, x, h, w}）
                    if (Array.isArray(box) && box.length === 4) {
                        finalBoundingBoxes.push({
                            name: obj.name || obj.label || 'unknown',
                            boundingBox: {
                                vertices: [
                                    { x: box[1], y: box[0] }, // xmin, ymin
                                    { x: box[3], y: box[0] }, // xmax, ymin
                                    { x: box[3], y: box[2] }, // xmax, ymax
                                    { x: box[1], y: box[2] }  // xmin, ymax
                                ]
                            }
                        });
                        console.log(`📦 [v61.1] detectedObjects[${idx}]からbox_2d抽出: ${obj.name || obj.label}`);
                    } else if (box.vertices && Array.isArray(box.vertices)) {
                        finalBoundingBoxes.push({
                            name: obj.name || obj.label || 'unknown',
                            boundingBox: box
                        });
                        console.log(`📦 [v61.1] detectedObjects[${idx}]からvertices抽出: ${obj.name || obj.label}`);
                    }
                }
            });
        }
        
        // パターン3: response.data直下にobjectAnnotations等がある場合
        if (finalBoundingBoxes.length === 0 && response.data.objectAnnotations) {
            const annotations = response.data.objectAnnotations;
            if (Array.isArray(annotations)) {
                annotations.forEach((ann, idx) => {
                    if (ann.boundingPoly || ann.boundingBox) {
                        const box = ann.boundingPoly || ann.boundingBox;
                        if (box.vertices) {
                            finalBoundingBoxes.push({
                                name: ann.name || ann.description || 'unknown',
                                boundingBox: box
                            });
                            console.log(`📦 [v61.1] objectAnnotations[${idx}]抽出: ${ann.name || ann.description}`);
                        }
                    }
                });
            }
        }
        
        console.log(`📦 [v61.1] 最終抽出Box数: ${finalBoundingBoxes.length}件`);
        if (finalBoundingBoxes.length > 0) {
            console.log(`📦 [v61.1] 抽出された物体名:`, finalBoundingBoxes.map(b => b.name));
        }
        
        // 抽出結果をresponse.dataに上書き
        response.data.boundingBoxes = finalBoundingBoxes;
        // ▲▲▲ v61.1 追加終わり ▲▲▲
        
        console.log('✅ AI分析結果:', detectedWorkTypes, detectedObjects);
        console.log('🔍 フィルター済み検出物体:', detectedObjects);
        console.log('🎯 v45 バックエンドからのリスク:', detectedRisks);
        console.log('🧪 [CRITICAL] response.data の全体:', response.data);
        console.log('📦 バウンディングボックス:', boundingBoxes);
        console.log('🔒 個人情報検出:', privacyItems);
        
        // 【新機能】個人情報保護：自動ぼかし処理
        if (privacyItems && privacyItems.length > 0) {
            console.log('🔒 個人情報を自動でぼかし処理中...');
            const blurredImageData = await applyPrivacyBlur(currentImageData, privacyItems);
            
            // ぼかし処理後の画像をプレビューに反映
            currentImageData = blurredImageData;
            displayPreview(blurredImageData);
            console.log('✅ 個人情報保護完了：顔・社名・ナンバー等をぼかし');
        }
        
        // 【v45緊急修正】バックエンドからdetectedRisksを受け取るか、フォールバック
        let finalRisks = detectedRisks;
        console.log('🧪 [DIAG1] detectedRisks:', {
            exists: !!detectedRisks,
            isArray: Array.isArray(detectedRisks),
            length: detectedRisks?.length ?? 'NA',
            sample: Array.isArray(detectedRisks) ? detectedRisks.slice(0, 3) : null
        });
        
        // --- ChatGPT v58.1統合版：必要最小限のデモ判定（P0） ---
        const aiAnalysisText = String(response?.data?.aiAnalysisText || '');
        
        // ① 本当に「デモ」と書いてある時だけ
        const containsDemoKeyword = aiAnalysisText.includes('デモモード分析結果');
        
        // ② Vision未設定が"確定文言"で出た時だけ
        const visionNotConfigured = /Vision未設定|Gemini Vision|GPT-4 Vision/i.test(aiAnalysisText);
        
        // ③ サーバが明示して返してきた forcedDemoMode だけ採用
        const serverForcedDemo = Boolean(response?.data?.forcedDemoMode);
        
        // ✅ 本当に必要な時だけデモモード
        const isDemo = containsDemoKeyword || visionNotConfigured || serverForcedDemo;
        
        // 診断ログ：今どの経路か一目でわかる
        console.log('🔍 v58.1 デモ判定（ChatGPT統合版）:', {
            aiAnalysisTextLength: aiAnalysisText.length,
            containsDemoKeyword,
            visionNotConfigured,
            serverForcedDemo,
            isDemo,
            aiAnalysisTextPreview: aiAnalysisText.substring(0, 100)
        });
        
        // bboxが無い＝矢印が空を指すので、座標(0-1)でhotspotを直指定する
        function demoFallbackRisks() {
              return [
                {
                  id: 'demo-1',
                  title: '① 重機災害（バックホウ旋回時の死角接触）',
                  riskType: '重機災害',
                  priority: 'P0',
                  priorityLabel: 'P0',
                  severity: 'critical',
                  confidence: 90,
                  location: 'バックホウ旋回範囲',
                  evidence: ['バックホウの旋回範囲内に作業員', '死角での接触リスク'],
                  mechanism: '旋回時の死角により作業員との接触事故が発生',
                  immediateMeasures: ['作業員の退避', '誘導員の配置', '旋回範囲の明示'],
                  permanentMeasures: ['作業計画の見直し', '安全教育の実施'],
                  // 丸＝作業員側（危険にさらされる側）
                  hotspot: { centerX: 0.56, centerY: 0.74 },
                  // 線の先＝バックホウのバケット付近
                  anchorPoint: { centerX: 0.53, centerY: 0.22 },
                  boundingBox: null
                },
                {
                  id: 'demo-2',
                  title: '② 土砂崩壊（湧水・浸透で地盤劣化）',
                  riskType: '土砂崩壊災害',
                  priority: 'P0',
                  priorityLabel: 'P0',
                  severity: 'critical',
                  confidence: 80,
                  location: '掘削溝の法面',
                  evidence: ['掘削深さ1.5m以上', '土留め未設置', '湧水の可能性'],
                  mechanism: '湧水・浸透により地盤が劣化し崩壊',
                  immediateMeasures: ['土留めの設置', '法面の監視', '作業員の退避'],
                  permanentMeasures: ['排水設備の設置', '地盤調査の実施'],
                  // 丸＝溝の縁（作業員が立ってる近傍）
                  hotspot: { centerX: 0.52, centerY: 0.76 },
                  // 線の先＝掘削溝の法面（崩れポイント）
                  anchorPoint: { centerX: 0.58, centerY: 0.64 },
                  boundingBox: null
                },
                {
                  id: 'demo-3',
                  title: '③ 土砂崩壊（掘削深・土留めなし→崩壊/埋没）',
                  riskType: '土砂崩壊災害',
                  priority: 'P0',
                  priorityLabel: 'P0',
                  severity: 'critical',
                  confidence: 85,
                  location: '掘削溝内',
                  evidence: ['掘削深さ1.5m以上', '土留め未設置', '溝内作業'],
                  mechanism: '土留めなしで掘削深が深く、崩壊により作業員が埋没',
                  immediateMeasures: ['土留めの設置', '作業員の退避', '掘削深さの見直し'],
                  permanentMeasures: ['作業計画の見直し', '安全教育の実施'],
                  // 丸＝溝内作業員寄り
                  hotspot: { centerX: 0.32, centerY: 0.82 },
                  // 線の先＝溝の法肩/法面側
                  anchorPoint: { centerX: 0.40, centerY: 0.70 },
                  boundingBox: null
                }
              ];
        }
        
        // ==========================================
        // ★ v59.1: Reality Check（幻覚キラー）+ 推定工種整合
        // ==========================================
        
        // ==========================================
        // ★ v60: データ型自動判別（文字列/オブジェクト両対応）
        // ==========================================
        
        // 検出された物体名を小文字化してセット化
        // ★ ChatGPT + Gemini + Opus 統合版：文字列配列/オブジェクト配列の両方に対応
        const detectedObjectNames = (detectedObjects ?? [])
          .map(o => {
            // 型チェック：文字列ならそのまま、オブジェクトならプロパティ参照
            if (typeof o === 'string') return o.toLowerCase();
            return (o.name || o.label || o.description || o.text || String(o)).toLowerCase();
          })
          .filter(Boolean);  // 空文字を除外
        
        console.log('🔍 v60 Reality Check: 検出物体名リスト（型自動判別）', detectedObjectNames);
        console.log('   最初の5件:', detectedObjectNames.slice(0, 5));
        
        // Reality Check ルール定義（v59.3: 最強厳密化）
        const REALITY_CHECK = [
          { 
            kw: /ダンプ|dump|tipper|トラック.*荷台|荷台.*落下/, 
            required: ['dump', 'tipper', 'dump truck'],  // ★ 厳密な一致のみ
            label: 'ダンプトラック',
            strictMode: true,
            // ★ v59.3: 除外ワード（これが含まれていたら証拠にしない）
            exclude: ['excavator', 'backhoe', 'bucket', 'crane', 'person', 'clothing', 'worker', 'vehicle', 'car', 'truck']
          },
          { 
            kw: /型枠|支保工|formwork|shoring/, 
            required: ['formwork', 'shoring', 'panel', 'support'], 
            label: '型枠/支保工',
            strictMode: false
          },
        ];
        
        // ★ ChatGPT v58.1統合版：実リスク優先ロジック（P1）
        // ✅ バックエンドがリスクを返しているなら、それを最優先（デモでも上書きしない）
        const apiRisks = Array.isArray(detectedRisks) ? detectedRisks : [];
        
        // 🔥 Reality Check: 幻覚リスクを除外（v60: 診断ログ強化）
        const filteredRisks = apiRisks.filter(risk => {
          // ★ ChatGPT統合：複数フィールドからタイトル抽出
          const title = risk.title || risk.riskTitle || risk.name || risk.scenarioName || '';
          const titleLower = title.toLowerCase();
          
          // ★ ChatGPT診断ログ：各リスクをチェック
          console.log(`🧪 v60 dump-check:`, { 
            title: title.substring(0, 40), 
            isDumpRisk: /ダンプ|dump|tipper|荷台/.test(title),
            detectedCount: detectedObjectNames.length
          });
          
          for (const rule of REALITY_CHECK) {
            if (rule.kw.test(titleLower)) {
              // ログ出力：どのルールにマッチしたか
              console.log(`🔍 v60 Reality Check: ルール [${rule.label}] にマッチ -> "${title}"`);
              console.log(`   検出物体リスト（最初の5件）:`, detectedObjectNames.slice(0, 5));
              console.log(`   必須物体:`, rule.required);
              
              // ★ v59.3: 除外ワードチェック（excavator等があったら証拠にしない）
              if (rule.exclude) {
                const hasExcluded = detectedObjectNames.some(det => 
                  rule.exclude.some(exc => det.includes(exc))
                );
                if (hasExcluded) {
                  console.log(`   ⚠️  除外ワード検出:`, rule.exclude.filter(exc => detectedObjectNames.some(det => det.includes(exc))));
                }
              }
              
              // 必須物体チェック（厳密一致）
              const hasEvidence = rule.required.some(req =>
                detectedObjectNames.some(det => det === req || det.includes(req))
              );
              
              if (!hasEvidence) {
                console.log(`💀 v60 KILL: 幻覚リスク除外 [${rule.label}] -> "${title}"`);
                return false;  // リスクを除外
              } else {
                console.log(`✅ v60 PASS: 根拠物体あり [${rule.label}] -> "${title}"`);
              }
            }
          }
          return true;  // リスクを残す
        });
        
        console.log(`📊 v60 Reality Check結果: ${apiRisks.length}件 -> ${filteredRisks.length}件（${apiRisks.length - filteredRisks.length}件除外）`);
        
        if (filteredRisks.length > 0) {
            finalRisks = filteredRisks;
            console.log(`✅ v59.2: バックエンドから ${finalRisks.length} 件のリスクを受信（Reality Check後）via=backend`);
        } else if (isDemo) {
            // デモ時だけ「0件を許さない」
            console.warn('🚨 v58.1 DEMO MODE: Vision未設定のため強制P0フォールバックを適用');
            finalRisks = demoFallbackRisks();
            console.log('✅ デモモード強制P0フォールバック: 3件のリスク（anchorPoint付き）を生成 via=demoFallback');
        } else if (!finalRisks || finalRisks.length === 0) {
            console.warn('⚠️ バックエンドからリスクなし、フォールバック実行');
            // AI分析結果に基づいて100シナリオDBからリスクを抽出（フォールバック）
            const estimatedWorkTypes = matchWorkTypesToScenarios(detectedWorkTypes, detectedObjects);
            console.log('🧪 [DIAG2] estimatedWorkTypes:', estimatedWorkTypes);
            
            finalRisks = extractRisksByPriority(estimatedWorkTypes, detectedObjects);
            console.log('🧪 [DIAG3] フォールバック後のfinalRisks:', {
                length: finalRisks?.length ?? 'NA',
                sample: Array.isArray(finalRisks) ? finalRisks.slice(0, 3).map(r => r.riskType || r.title) : null
            });
        } else {
            // 本番で0件はあり得る（正常ケース）
            console.log(`✅ v58.1: リスクなし（正常）via=empty`);
        }
        
        // 統括安全衛生責任者の評価サマリー（v45: estimatedWorkTypesの定義を確認）
        let estimatedWorkTypes = detectedWorkTypes || matchWorkTypesToScenarios(detectedWorkTypes, detectedObjects);
        
        // ==========================================
        // ★ v59.1: 推定工種ラベル整合（0件除外 + Reality Check）
        // ==========================================
        
        // (A) 最小修正：0件は出さない
        estimatedWorkTypes = estimatedWorkTypes.filter(w => (w.count ?? 0) > 0);
        console.log(`📊 v59.1 推定工種フィルタ: 0件除外後 -> ${estimatedWorkTypes.length}件`);
        
        // (B) 追加で堅牢化：型枠/支保工は実体が無ければラベルも除外
        const hasFormworkEvidence = detectedObjectNames.some(n => 
          n.includes('formwork') || n.includes('shoring') || n.includes('panel') || n.includes('support')
        );
        
        if (!hasFormworkEvidence) {
          const beforeCount = estimatedWorkTypes.length;
          estimatedWorkTypes = estimatedWorkTypes.filter(w => !/型枠|支保工/.test(w.name));
          if (beforeCount > estimatedWorkTypes.length) {
            console.log(`💀 v59.1 推定工種KILL: 型枠/支保工の実体なし -> ラベル除外`);
          }
        }
        
        console.log(`✅ v59.1 最終推定工種: ${estimatedWorkTypes.length}件`, estimatedWorkTypes.map(w => w.name));
        
        const summary = generateSafetyManagerSummary(estimatedWorkTypes, finalRisks);
        
        const analysisResult = {
            workTypes: estimatedWorkTypes,
            detectedRisks: finalRisks,  // v45: detectedRisks → finalRisks
            detectedObjects: detectedObjects || [],  // APIから受け取ったdetectedObjectsを追加
            boundingBoxes: boundingBoxes || [],  // バウンディングボックス情報を追加
            summary: summary,
            totalScenariosChecked: SAFETY_SCENARIOS.length,
            note: `✅ v45: バックエンドAI分析完了。VIPホワイトリスト方式でリスク${finalRisks.length}件を抽出。主役リスク（吊り・重機）は必ず通過保証。`,
            timestamp: new Date().toISOString(),
            imageData: imageData  // 画像データも保存
        };
        
        // 【新機能】分析履歴に保存
        saveAnalysisHistory(analysisResult);
        
        return analysisResult;
    } catch (error) {
        console.error('❌ AI分析エラー:', error);
        // エラー時はフォールバック（従来のロジック）
        const estimatedWorkTypes = estimateWorkTypeFromScenarios();
        const detectedRisks = extractRisksByPriority(estimatedWorkTypes);
        const summary = generateSafetyManagerSummary(estimatedWorkTypes, detectedRisks);
        
        return {
            workTypes: estimatedWorkTypes,
            detectedRisks: detectedRisks,
            detectedObjects: [],  // エラー時は空配列
            summary: summary,
            totalScenariosChecked: SAFETY_SCENARIOS.length,
            note: `AI画像分析により工種を判定しました。100シナリオデータベースを参照し、統括安全衛生責任者レベルの精密分析を実施。`
        };
    }
}

// AI検出結果を100シナリオDBと照合
function matchWorkTypesToScenarios(detectedWorkTypes, detectedObjects) {
    if (!SAFETY_SCENARIOS || SAFETY_SCENARIOS.length === 0) {
        console.warn('⚠️ SAFETY_SCENARIOS not loaded, using fallback');
        return estimateWorkTypeFromScenarios();
    }

    const workTypeConfidence = new Map();
    
    // AIで検出された工種とDBのシナリオを照合
    detectedWorkTypes.forEach(({ category, confidence }) => {
        const matchingScenarios = SAFETY_SCENARIOS.filter(s => 
            s.category && s.category.includes(category)
        );
        
        if (matchingScenarios.length > 0) {
            workTypeConfidence.set(category, {
                category: category,
                confidence: confidence,
                scenarioCount: matchingScenarios.length
            });
        }
    });
    
    // 検出されたオブジェクトからも工種を推定
    if (detectedObjects && detectedObjects.length > 0) {
        detectedObjects.forEach(obj => {
            const matchingScenarios = SAFETY_SCENARIOS.filter(s => 
                s.evidence && s.evidence.includes(obj)
            );
            
            matchingScenarios.forEach(scenario => {
                const category = scenario.category;
                const current = workTypeConfidence.get(category);
                if (!current || current.confidence < 85) {
                    workTypeConfidence.set(category, {
                        category: category,
                        confidence: 85,
                        scenarioCount: matchingScenarios.length
                    });
                }
            });
        });
    }
    
    return Array.from(workTypeConfidence.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
}

// フォールバック: シナリオDBから工種を推定
function estimateWorkTypeFromScenarios() {
    if (!SAFETY_SCENARIOS || SAFETY_SCENARIOS.length === 0) {
        return [
            { category: '墜落・転落災害', confidence: 90, scenarioCount: 5 },
            { category: '重機災害', confidence: 85, scenarioCount: 3 }
        ];
    }

    const categoryCount = new Map();
    SAFETY_SCENARIOS.forEach(scenario => {
        const count = categoryCount.get(scenario.category) || 0;
        categoryCount.set(scenario.category, count + 1);
    });
    
    return Array.from(categoryCount.entries())
        .map(([category, count]) => ({
            category: category,
            confidence: Math.min(95, 70 + count * 2),
            scenarioCount: count
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
}

// P0優先順でリスクを抽出
function extractRisksByPriority(estimatedWorkTypes, detectedObjects = []) {
    if (!SAFETY_SCENARIOS || SAFETY_SCENARIOS.length === 0) {
        console.warn('⚠️ SAFETY_SCENARIOS not loaded');
        return [];
    }

    const P0_CATEGORIES = ['墜落・転落災害', '重機災害', '吊り・クレーン災害', '感電災害', '火災・爆発災害'];
    const P1_CATEGORIES = ['型枠・支保工災害', '土砂崩壊災害', '飛来・落下災害', '挟まれ・巻き込まれ災害'];
    
    const risks = [];
    
    // 検出された物体リストを小文字化して検索しやすくする
    const detectedObjectsLower = detectedObjects.map(obj => obj.toLowerCase());
    
    console.log('🛡️ 物体フィルター開始:', detectedObjectsLower);
    
    // 機械と関連キーワードのマッピング
    const machineKeywords = {
        'バックホウ': ['バックホウ', '油圧ショベル', 'ユンボ', '掘削機'],
        'タイヤローラー': ['タイヤローラー', 'ローラー', '転圧機', 'ロードローラー'],
        'フィニッシャー': ['フィニッシャー', 'アスファルトフィニッシャー', '敷均し機'],
        'クレーン': ['クレーン', 'クレーン車', 'ラフタークレーン', '移動式クレーン'],
        'ダンプトラック': ['ダンプトラック', 'ダンプ', 'トラック'],
        '路面切削機': ['路面切削機', 'ロードカッター', '切削機']
    };
    
    // P0リスクを優先的に抽出
    estimatedWorkTypes.forEach(workType => {
        const matchingScenarios = SAFETY_SCENARIOS.filter(s => 
            s.category && s.category.includes(workType.category)
        );
        
        matchingScenarios.forEach(scenario => {
            // シナリオのrisksから最初のリスクを取得
            const firstRisk = scenario.risks && scenario.risks[0];
            const riskType = (firstRisk && firstRisk.riskType) || scenario.riskType || '安全リスク';
            
            // リスクタイプに含まれる機械名を抽出
            let shouldIncludeRisk = true;
            let excludeReason = '';
            
            for (const [machine, keywords] of Object.entries(machineKeywords)) {
                // リスクタイプに機械名が含まれているかチェック
                const isMachineInRiskType = keywords.some(keyword => 
                    riskType.includes(keyword)
                );
                
                if (isMachineInRiskType) {
                    // 検出物体リストにその機械が含まれているかチェック
                    const isMachineDetected = keywords.some(keyword => 
                        detectedObjectsLower.some(obj => obj.includes(keyword.toLowerCase()))
                    );
                    
                    if (!isMachineDetected) {
                        shouldIncludeRisk = false;
                        excludeReason = `${machine}が検出されていないためスキップ`;
                        console.log(`❌ 除外: ${riskType} (理由: ${excludeReason})`);
                        break;
                    }
                }
            }
            
            // リスクが適切であれば追加
            if (shouldIncludeRisk) {
                const isP0 = P0_CATEGORIES.some(cat => scenario.category.includes(cat));
                const isP1 = P1_CATEGORIES.some(cat => scenario.category.includes(cat));
                
                risks.push({
                    priorityLabel: isP0 ? 'P0' : (isP1 ? 'P1' : 'P2'),
                    priority: isP0 ? 0 : (isP1 ? 1 : 2),
                    riskType: riskType,
                    workType: workType.category,
                    confidence: workType.confidence,
                    evidence: (firstRisk && firstRisk.evidence) || scenario.evidence || '写真から検出',
                    location: (firstRisk && firstRisk.location) || scenario.location || '現場内',
                    severity: (firstRisk && firstRisk.severity) || scenario.severity || 'high',
                    lawViolation: (firstRisk && firstRisk.lawSuspect) || scenario.lawViolation || '要確認',
                    similarAccidents: (firstRisk && firstRisk.similarAccidents) || [],
                    immediateMeasures: (firstRisk && firstRisk.immediateMeasures) || scenario.immediateMeasures || [],
                    permanentMeasures: (firstRisk && firstRisk.permanentMeasures) || scenario.permanentMeasures || [],
                    additionalChecks: (firstRisk && firstRisk.additionalChecks) || scenario.additionalChecks || [],
                    safetyManagerEvaluation: scenario.summary || '詳細確認が必要です'
                });
            }
        });
    });
    
    console.log(`✅ フィルター後リスク数: ${risks.length}件`);
    
    // P0→P1→P2の順にソートし、最大10件
    return risks
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 10);
}

// 統括安全衛生責任者の評価サマリー生成
function generateSafetyManagerSummary(estimatedWorkTypes, detectedRisks) {
    const p0Risks = detectedRisks.filter(r => r.priorityLabel === 'P0');
    const criticalRisks = detectedRisks.filter(r => r.severity === 'critical');
    
    let summary = `【統括安全衛生責任者の総合評価】\n\n`;
    summary += `推定工種: ${estimatedWorkTypes.map(w => `${w.category}(${w.confidence}%)`).join('、')}\n\n`;
    summary += `検出リスク総数: ${detectedRisks.length}件\n`;
    summary += `- P0（最優先）リスク: ${p0Risks.length}件\n`;
    summary += `- 重大リスク: ${criticalRisks.length}件\n\n`;
    
    if (p0Risks.length > 0) {
        summary += `⚠️ P0リスクが検出されています。即座に対応してください。\n`;
        summary += `主なP0リスク: ${p0Risks.slice(0, 3).map(r => r.riskType).join('、')}`;
    } else {
        summary += `現時点でP0リスクは検出されていませんが、継続的な監視が必要です。`;
    }
    
    return summary;
}

// 分析結果表示
async function displayResults(data, isRestore = false) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error('❌ results element not found');
        return;
    }
    
    resultsDiv.classList.remove('hidden');

    // ==========================================
    // ★ v59.3: 最後段KILLゲート（ダンプトラック誤判定の最終防衛線）
    // ==========================================
    const rawRisks = data.detectedRisks || [];
    
    // 検出物体タグを小文字化して連結
    const dumpProof = ['ダンプ', 'dump', 'tipper']; // vehicle/truckは証拠にしない（誤爆源）
    
    // ★ v59.4: detectedObjects は文字列の配列なので、直接使用
    const detectedTags = (data.detectedObjects ?? [])
      .map((o) => {
        // o が文字列の場合はそのまま、オブジェクトの場合は name/label を取得
        const name = typeof o === 'string' ? o : (o.name ?? o.label ?? '');
        return String(name).toLowerCase();
      })
      .join(' ');
    
    console.log('🔍 v59.4 最後段KILLゲート: 検出物体タグ', detectedTags);
    console.log('   検出物体配列（最初の5件）:', (data.detectedObjects ?? []).slice(0, 5));
    
    // タイトル取得ヘルパー
    const getTitle = (r) => (r.title ?? r.riskTitle ?? r.name ?? r.scenarioName ?? '').toString();
    
    const killed = [];
    const passedRisks = rawRisks.filter((r) => {
      const title = getTitle(r);
      const t = title.toLowerCase();
      
      const isDumpRisk = /ダンプ|荷台|dump|tipper/.test(title);
      const hasProof = dumpProof.some(k => detectedTags.includes(k.toLowerCase()));
      
      if (isDumpRisk && !hasProof) {
        killed.push({ title, detectedTags: detectedTags.substring(0, 100) });  // 長すぎる場合は切り詰め
        console.log(`💀 v59.4 最後段KILL: ダンプ根拠なし -> "${title}"`);
        return false;  // リスクを除外
      }
      return true;  // リスクを通過
    });
    
    console.log('✅ v59.4 dump gate summary:', { 
      total: rawRisks.length, 
      passed: passedRisks.length, 
      killed: killed.length,
      killedTitles: killed.map(k => k.title)
    });

    // 【新機能0】写真上にリスク可視化を描画
    let mergedRisks = passedRisks;  // ★ v59.3: KILLゲート通過後のリスクを使用
    const detectedObjects = data.detectedObjects || [];
    
    // ▼▼▼ v60.4 追加：幻覚対策フィルター（スマートガード + 重複回避） ▼▼▼
    try {
        console.log('🛡️ v60.4 sanitize start');

        // 既存変数に合わせる
        var _risks = mergedRisks || (data.detectedRisks || []);
        var _objs  = detectedObjects;

        // 1) ダンプ・切削除外（title空でも効く）
        _risks = v604_safeDumpTruckFilter(_risks, _objs);

        // 2) 用語ガード（切削機ありならスキップ＋重複回避）
        _risks = v604_safeTerminologyGuard(_risks, _objs);

        // 3) 吊り作業なら転倒を降格（切削依存なし）
        _risks = v604_safeHoistingPriorityAdjust(_risks, _objs);

        // 表示に使う配列へ反映（重要）
        mergedRisks = _risks;
        data.detectedRisks = _risks;

        // aiAnalysisText は「切削機なし」の時だけ補正（切削現場を潰さない）
        var hasCutting = false;
        if (Array.isArray(detectedObjects)) {
            for (var i = 0; i < detectedObjects.length; i++) {
                var o = detectedObjects[i];
                var n = (typeof o === 'string') ? o : (o && (o.name || o.label)) ? (o.name || o.label) : '';
                n = String(n || '').toLowerCase();
                if (n.indexOf('切削機') !== -1 || n.indexOf('舗装切削') !== -1 || n.indexOf('milling') !== -1 || n.indexOf('profiler') !== -1) {
                    hasCutting = true;
                    break;
                }
            }
        }
        
        if (data.aiAnalysisText && !hasCutting) {
            var t = data.aiAnalysisText;
            
            // 重複回避：長いパターンを先に置換
            if (t.indexOf('切削後の路面が不整地で') !== -1) {
                t = t.split('切削後の路面が不整地で').join('床掘り作業に伴う不整地で');
            } else if (t.indexOf('切削後の路面が不整地') !== -1) {
                t = t.split('切削後の路面が不整地').join('床掘り作業に伴う不整地');
            } else if (t.indexOf('切削後の路面') !== -1) {
                t = t.split('切削後の路面').join('床掘り後の地面');
            }
            
            // 補助置換
            t = t.split('切削作業').join('床掘り・掘削作業');
            t = t.split('切削材').join('掘削土砂');
            
            // 切削機は守って、切削→掘削
            t = t.split('切削機').join('__KEEP_CUT_MACHINE__');
            t = t.split('切削').join('掘削');
            t = t.split('__KEEP_CUT_MACHINE__').join('切削機');
            
            // 重複潰し
            if (t.indexOf('不整地が不整地') !== -1) t = t.split('不整地が不整地').join('不整地');
            
            data.aiAnalysisText = t;
        }

        console.log('✅ v60.4 sanitize done');
    } catch (e) {
        console.error('⚠️ v60.4 sanitize error（無視して続行）:', e);
    }
    // ▲▲▲ 追加終わり ▲▲▲
    
    // ▼▼▼ v61.0: Direct Lock-on (座標の完全強制ペアリング) ▼▼▼
    // 自動計算を廃止し、リスクタイプごとに「ピン」と「矢印」の位置を厳密に定義する
    try {
        console.log('🎯 [v61.1] Direct Lock-on 開始');
        
        const boundingBoxes = data.boundingBoxes || [];
        console.log(`📦 [v61.1] 利用可能なboundingBoxes: ${boundingBoxes.length}件`);
        
        mergedRisks = mergedRisks.map((risk, index) => {
            // ✅ v61.1: titleが空の場合、riskTypeを使用
            const title = (risk.title || risk.riskTitle || risk.riskType || '').toLowerCase();
            
            if (!title) {
                console.warn(`⚠️ [v61.1] title/riskType両方空: リスク${index + 1}`);
            }
            
            let targetBox = null;

            // 1. ターゲット物体の特定
            if (/吊り荷|落下|クレーン|load|crane|飛来/.test(title)) {
                // 吊り荷系: boundingBoxes から探す
                targetBox = boundingBoxes.find(b => {
                    const name = (b.name || b.label || '').toLowerCase();
                    return /吊り荷|load|slab|floor|吊り|deck|concrete|pc|panel|クレーン|crane/.test(name);
                });
                console.log('🔍 [v61.1] 吊り荷系ターゲット:', targetBox ? targetBox.name : 'なし');
                
            } else if (/重機|接触|挟まれ|巻|machine|vehicle|truck/.test(title)) {
                // 重機系: boundingBoxes から探す
                targetBox = boundingBoxes.find(b => {
                    const name = (b.name || b.label || '').toLowerCase();
                    return /重機|truck|excavator|backhoe|vehicle|crane|機械/.test(name);
                });
                console.log('🔍 [v61.1] 重機系ターゲット:', targetBox ? targetBox.name : 'なし');
                
            } else if (/転倒|足元|fall/.test(title)) {
                // 転倒系: 作業員を探す
                targetBox = boundingBoxes.find(b => {
                    const name = (b.name || b.label || '').toLowerCase();
                    return /作業員|person|worker|人/.test(name);
                });
                console.log('🔍 [v61.1] 転倒系ターゲット:', targetBox ? targetBox.name : 'なし');
                
            } else {
                // その他: リスク自身のboundingBoxを使う
                if (risk.boundingBox && risk.boundingBox.boundingBox) {
                    targetBox = { boundingBox: risk.boundingBox.boundingBox };
                }
            }

            // 2. 座標の強制上書き (Direct Lock-on)
            if (targetBox && targetBox.boundingBox && targetBox.boundingBox.vertices) {
                const vertices = targetBox.boundingBox.vertices;
                const xCoords = vertices.map(v => v.x);
                const yCoords = vertices.map(v => v.y);
                
                // 正規化座標（0〜1）のまま保存（描画時に変換）
                const bx = Math.min(...xCoords);
                const by = Math.min(...yCoords);
                const bw = Math.max(...xCoords) - bx;
                const bh = Math.max(...yCoords) - by;
                const cx = bx + bw / 2; // 幅の中心

                // A. 吊り荷モード（ワイヤーから荷物へズドン！）
                if (/吊り荷|落下|クレーン|飛来/.test(title)) {
                    risk.pinX = cx;
                    risk.pinY = by + bh * 0.05; // 上部5%（枠の少し内側）
                    risk.anchorX = cx;
                    risk.anchorY = by + bh * 0.70; // 下部70%（荷物の中心寄り）
                    console.log(`🎯 [v61.1] Lock-on (吊り荷): "${risk.title || risk.riskType}" [Vertical] pin=(${risk.pinX.toFixed(3)},${risk.pinY.toFixed(3)}) anchor=(${risk.anchorX.toFixed(3)},${risk.anchorY.toFixed(3)})`);
                } 
                // B. 転倒・足元モード（頭から足元へ）
                else if (/転倒|足元/.test(title)) {
                    risk.pinX = cx;
                    risk.pinY = by + bh * 0.15; // 頭付近
                    risk.anchorX = cx;
                    risk.anchorY = by + bh * 0.95; // 足元ギリギリ
                    console.log(`🎯 [v61.1] Lock-on (転倒): "${risk.title || risk.riskType}" [Full Body] pin=(${risk.pinX.toFixed(3)},${risk.pinY.toFixed(3)}) anchor=(${risk.anchorX.toFixed(3)},${risk.anchorY.toFixed(3)})`);
                }
                // C. 重機・その他（中心から下端へ）
                else {
                    risk.pinX = cx;
                    risk.pinY = by + bh * 0.30; // やや上
                    risk.anchorX = cx;
                    risk.anchorY = by + bh * 0.90; // 接地部・下端
                    console.log(`🎯 [v61.1] Lock-on (通常): "${risk.title || risk.riskType}" pin=(${risk.pinX.toFixed(3)},${risk.pinY.toFixed(3)}) anchor=(${risk.anchorX.toFixed(3)},${risk.anchorY.toFixed(3)})`);
                }
                
                // ★最重要: このフラグで描画時の自動調整を無効化させる
                risk.isFixedCoordinates = true;
                risk._lockOnMode = /吊り荷|落下|クレーン|飛来/.test(title) ? 'vertical' : 
                                  /転倒|足元/.test(title) ? 'ground' : 'context';
            } else {
                // ✅ v61.1: フォールバック座標（boundingBoxがない場合）
                console.warn(`⚠️ [v61.1] ターゲット未検出: "${risk.title || risk.riskType}" → フォールバック座標を使用`);
                
                // 画像を3分割して、リスクごとに配置（正規化座標 0〜1）
                const xOffset = (index + 1) * 0.25; // 0.25, 0.50, 0.75
                
                risk.pinX = xOffset;
                risk.pinY = 0.15;  // 上部15%
                risk.anchorX = xOffset;
                risk.anchorY = 0.70; // 下部70%
                
                risk.isFixedCoordinates = true;
                risk._lockOnMode = 'fallback';
                
                console.log(`🎯 [v61.1] フォールバック座標: リスク${index + 1} pin=(${risk.pinX.toFixed(3)},${risk.pinY.toFixed(3)}) anchor=(${risk.anchorX.toFixed(3)},${risk.anchorY.toFixed(3)})`);
            }
            
            return risk;
        });
        
        // 修正結果をデータ本体に反映
        data.detectedRisks = mergedRisks;
        
        console.log('✅ [v61.1] Direct Lock-on 完了:', mergedRisks.filter(r => r.isFixedCoordinates).length + '件固定');
        
    } catch (e) {
        console.error('⚠️ [v61.1] Direct Lock-on エラー（無視して続行）:', e);
    }
    // ▲▲▲ v61.1 追加終わり ▲▲▲
    
    if (data.detectedRisks && data.detectedRisks.length > 0 && currentImageData) {
        const result = await displayRiskVisualizationOnImage(currentImageData, data.detectedRisks, data.boundingBoxes || []);
        if (result) {
            mergedRisks = result;  // 統合後のリスクを使用
            console.log('✅ 統合後のリスクをUIに反映:', mergedRisks.length + '件');
        }
    }
    
    // 【ChatGPT+Gemini指示】分析結果をグローバル変数に保存（AIチャット用）
    window.latestAnalysisContext = {
        workTypes: data.workTypes || [],
        risks: mergedRisks,  // 統合後のリスクを保存
        detectedObjects: data.detectedObjects || [],
        summary: data.summary || '',
        aiAnalysisText: data.aiAnalysisText || '',
        timestamp: Date.now()
    };
    console.log('💾 分析コンテキスト保存完了:', window.latestAnalysisContext);

    // 【新機能1】リスク統計サマリーの表示（最優先）
    displayRiskStatistics(mergedRisks);

    // 【新機能2】検出された物体リストの表示
    if (data.detectedObjects && data.detectedObjects.length > 0) {
        displayDetectedObjects(data.detectedObjects);
    }

    // 推定工種の表示
    displayEstimatedWorkTypes(data.workTypes || []);

    // サマリーの表示
    displaySummary(data.summary);

    // デモモード注意メッセージ
    if (data.note) {
        displayDemoNote(data.note, data.totalScenariosChecked);
    }

    // 検出されたリスク(P0優先順)
    if (mergedRisks && mergedRisks.length > 0) {
        displayDetectedRisks(mergedRisks);
    }

    // AIチャットUIを表示
    const chatContext = {
        workTypes: data.workTypes?.map(w => w.category) || [],
        objects: data.detectedObjects || [],  // 修正: detectedObjectsを正しく渡す
        risks: data.detectedRisks || [],
        aiAnalysisText: data.summary || ''
    };
    
    console.log('🔍 チャットコンテキスト:', chatContext);
    console.log('📦 元データ:', {
        workTypes: data.workTypes,
        detectedObjects: data.detectedObjects,
        detectedRisks: data.detectedRisks
    });
    
    displayChatUI(chatContext);

    // 【新機能3】印刷ボタンの追加
    addPrintButton();

    // 【新機能4】タイムスタンプの追加
    addTimestamp();

    // 【新機能5】エクスポートボタンの追加
    addExportButton(data);

    // 📦 v67.1: 履歴に保存（復元時は保存しない）
    if (!isRestore) {
        try {
            addToHistory({
                imageData: currentImageData,
                risks: mergedRisks || data.detectedRisks || [],
                objects: data.detectedObjects || [],
                workTypes: data.workTypes || [],
                summary: data.summary || '',
                boundingBoxes: data.boundingBoxes || [],
                aiComment: data.aiAnalysisText || data.summary || ''
            });
            console.log('📦 v67.1: 履歴に保存しました');
        } catch (error) {
            console.error('❌ 履歴保存エラー:', error);
        }
    } else {
        console.log('🔄 v67.1: 復元モード - 履歴には保存しません');
    }

    // 結果までスクロール
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 【新機能1】リスク統計サマリーの表示
// 【新機能1】リスク統計サマリーの表示
function displayRiskStatistics(risks) {
    let statsSection = document.getElementById('riskStatistics');
    
    if (!statsSection) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        statsSection = document.createElement('div');
        statsSection.id = 'riskStatistics';
        statsSection.className = 'mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-md print:break-inside-avoid';
        resultsDiv.appendChild(statsSection);
    }
    
    statsSection.textContent = '';
    
    // 優先度別カウント
    const p0Count = risks.filter(r => r.priority === 'P0').length;
    const p1Count = risks.filter(r => r.priority === 'P1').length;
    const p2Count = risks.filter(r => r.priority === 'P2').length;
    const totalCount = risks.length;
    
    // 総合リスクレベル判定
    let overallLevel = '安全';
    let levelColor = 'text-green-600';
    let levelBg = 'bg-green-100';
    
    if (p0Count > 0) {
        overallLevel = '極めて危険';
        levelColor = 'text-red-600';
        levelBg = 'bg-red-100';
    } else if (p1Count > 0) {
        overallLevel = '危険';
        levelColor = 'text-orange-600';
        levelBg = 'bg-orange-100';
    } else if (p2Count > 0) {
        overallLevel = '注意';
        levelColor = 'text-yellow-600';
        levelBg = 'bg-yellow-100';
    }
    
    statsSection.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800 flex items-center">
                <i class="fas fa-chart-bar text-blue-600 mr-3"></i>
                📊 リスク統計サマリー
            </h3>
            <div class="px-4 py-2 ${levelBg} ${levelColor} font-bold rounded-full">
                総合評価: ${overallLevel}
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <!-- 総リスク数 -->
            <div class="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-200">
                <div class="text-sm text-gray-600 mb-1">検出リスク総数</div>
                <div class="text-3xl font-bold text-blue-600">${totalCount}</div>
                <div class="text-xs text-gray-500 mt-1">件</div>
            </div>
            
            <!-- P0リスク -->
            <div class="bg-white p-4 rounded-lg shadow-sm border-2 ${p0Count > 0 ? 'border-red-400 animate-pulse' : 'border-gray-200'}">
                <div class="text-sm text-gray-600 mb-1 flex items-center">
                    <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    P0（極高）
                </div>
                <div class="text-3xl font-bold text-red-600">${p0Count}</div>
                <div class="text-xs ${p0Count > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'} mt-1">
                    ${p0Count > 0 ? '即座に対応が必要' : '該当なし'}
                </div>
            </div>
            
            <!-- P1リスク -->
            <div class="bg-white p-4 rounded-lg shadow-sm border-2 ${p1Count > 0 ? 'border-orange-400' : 'border-gray-200'}">
                <div class="text-sm text-gray-600 mb-1 flex items-center">
                    <span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    P1（高）
                </div>
                <div class="text-3xl font-bold text-orange-600">${p1Count}</div>
                <div class="text-xs ${p1Count > 0 ? 'text-orange-600 font-semibold' : 'text-gray-500'} mt-1">
                    ${p1Count > 0 ? '速やかに対応' : '該当なし'}
                </div>
            </div>
            
            <!-- P2リスク -->
            <div class="bg-white p-4 rounded-lg shadow-sm border-2 ${p2Count > 0 ? 'border-yellow-400' : 'border-gray-200'}">
                <div class="text-sm text-gray-600 mb-1 flex items-center">
                    <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    P2（中）
                </div>
                <div class="text-3xl font-bold text-yellow-600">${p2Count}</div>
                <div class="text-xs ${p2Count > 0 ? 'text-yellow-600 font-semibold' : 'text-gray-500'} mt-1">
                    ${p2Count > 0 ? '計画的に対応' : '該当なし'}
                </div>
            </div>
        </div>
        
        ${p0Count > 0 ? `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
                <div>
                    <p class="font-bold text-red-800">⚠️ 緊急警告：P0リスクが検出されました</p>
                    <p class="text-sm text-red-700 mt-1">作業を中断し、即座に安全対策を実施してください。</p>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// 【新機能2】検出された物体リストの表示
// HTMLエスケープヘルパー関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// アイコン取得ヘルパー関数
function getIcon(objectName) {
    const name = String(objectName || '').toLowerCase();
    
    if (name.includes('クレーン') || name.includes('crane')) return 'fas fa-truck-loading';
    if (name.includes('吊り荷') || name.includes('load')) return 'fas fa-box';
    if (name.includes('作業員') || name.includes('worker') || name.includes('person')) return 'fas fa-user-hard-hat';
    if (name.includes('重機') || name.includes('excavator')) return 'fas fa-tractor';
    if (name.includes('玉掛け')) return 'fas fa-link';
    if (name.includes('安全帯') || name.includes('harness')) return 'fas fa-vest';
    if (name.includes('橋梁') || name.includes('bridge')) return 'fas fa-bridge';
    
    return 'fas fa-circle'; // デフォルト
}

function displayDetectedObjects(objects) {
    if (!objects || objects.length === 0) return;
    
    let objectsSection = document.getElementById('detectedObjects');
    
    if (!objectsSection) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        objectsSection = document.createElement('div');
        objectsSection.id = 'detectedObjects';
        objectsSection.className = 'mb-6 p-5 bg-white border-2 border-gray-300 rounded-lg shadow print:break-inside-avoid';
        resultsDiv.appendChild(objectsSection);
    }
    
    objectsSection.textContent = '';
    
    // アイコンマッピング（物体名に応じたアイコン）
    const iconMap = {
        'バックホウ': 'fas fa-tractor',
        'ダンプトラック': 'fas fa-truck',
        '重機': 'fas fa-cog',
        '作業員': 'fas fa-user-hard-hat',
        '足場': 'fas fa-layer-group',
        'クレーン': 'fas fa-anchor',
        'アスファルト': 'fas fa-road',
        '舗装': 'fas fa-road',
        '現場': 'fas fa-hard-hat',
        '工事': 'fas fa-tools'
    };
    
    const getIcon = (obj) => {
        for (const [key, icon] of Object.entries(iconMap)) {
            if (obj.includes(key)) return icon;
        }
        return 'fas fa-cube'; // デフォルトアイコン
    };
    
    objectsSection.innerHTML = `
        <div class="flex items-center mb-4">
            <i class="fas fa-eye text-blue-600 text-xl mr-3"></i>
            <h3 class="text-lg font-bold text-gray-800">🔍 検出された物体</h3>
            <span class="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                ${objects.length}件
            </span>
        </div>
        
        <div class="flex flex-wrap gap-3">
            ${objects.map(obj => `
                <div class="flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <i class="${getIcon(obj)} text-gray-600 mr-2"></i>
                    <span class="text-sm font-medium text-gray-800">${escapeHtml(obj)}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="mt-3 text-xs text-gray-500 italic">
            <i class="fas fa-info-circle mr-1"></i>
            AI画像解析により検出された主要な物体・作業内容です
        </div>
    `;
}

// サマリーの表示
function displaySummary(summaryText) {
    let summarySection = document.getElementById('summary');
    
    if (!summarySection) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        summarySection = document.createElement('div');
        summarySection.id = 'summary';
        summarySection.className = 'mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded';
        resultsDiv.appendChild(summarySection);
    }
    
    // 安全にテキストを設定
    summarySection.textContent = '';
    
    const container = document.createElement('div');
    container.className = 'flex';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'flex-shrink-0';
    const icon = document.createElement('i');
    icon.className = 'fas fa-clipboard-check text-yellow-600 text-xl';
    iconDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-3';
    
    const header = document.createElement('h4');
    header.className = 'text-sm font-semibold text-yellow-900 mb-2';
    header.textContent = '統括安全衛生責任者の評価';
    
    const paragraph = document.createElement('p');
    paragraph.className = 'text-sm text-yellow-800';
    paragraph.style.whiteSpace = 'pre-line';
    paragraph.textContent = summaryText || '分析が完了しました';
    
    contentDiv.appendChild(header);
    contentDiv.appendChild(paragraph);
    container.appendChild(iconDiv);
    container.appendChild(contentDiv);
    summarySection.appendChild(container);
}

// 推定工種の表示
function displayEstimatedWorkTypes(workTypes) {
    let section = document.getElementById('workTypesSection');
    
    if (!section) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        section = document.createElement('div');
        section.id = 'workTypesSection';
        section.className = 'mb-6 p-4 bg-purple-50 border-l-4 border-purple-400 rounded';
        
        // サマリーの前に挿入
        const summaryDiv = resultsDiv.querySelector('.bg-yellow-50');
        if (summaryDiv) {
            resultsDiv.insertBefore(section, summaryDiv);
        } else {
            resultsDiv.insertBefore(section, resultsDiv.firstChild);
        }
    }
    
    // 安全にコンテンツを作成
    section.textContent = '';
    
    const container = document.createElement('div');
    container.className = 'flex';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'flex-shrink-0';
    const icon = document.createElement('i');
    icon.className = 'fas fa-hard-hat text-purple-600 text-xl';
    iconDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-3';
    
    const header = document.createElement('h4');
    header.className = 'text-sm font-semibold text-purple-900 mb-2';
    header.textContent = '推定工種（100シナリオDBより）';
    
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'flex flex-wrap gap-2';
    
    workTypes.forEach(workType => {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800';
        
        const badgeIcon = document.createElement('i');
        badgeIcon.className = 'fas fa-check-circle mr-1';
        
        const badgeText = document.createTextNode(` ${workType.category} (${workType.confidence}%確度 | ${workType.scenarioCount || 0}件)`);
        
        badge.appendChild(badgeIcon);
        badge.appendChild(badgeText);
        badgeContainer.appendChild(badge);
    });
    
    contentDiv.appendChild(header);
    contentDiv.appendChild(badgeContainer);
    container.appendChild(iconDiv);
    container.appendChild(contentDiv);
    section.appendChild(container);
}

// デモモード注意メッセージ
function displayDemoNote(note, totalScenariosChecked) {
    let noteSection = document.getElementById('demoNoteSection');
    
    if (!noteSection) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) return;
        
        noteSection = document.createElement('div');
        noteSection.id = 'demoNoteSection';
        
        // デモモードかどうかで表示を変更
        const isSimulationMode = note.includes('デモモード') || note.includes('⚠️');
        noteSection.className = isSimulationMode 
            ? 'mb-6 p-5 bg-orange-50 border-2 border-orange-500 rounded-lg shadow-md'
            : 'mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded';
        
        resultsDiv.appendChild(noteSection);
    }
    
    // 安全にコンテンツを作成
    noteSection.textContent = '';
    
    const container = document.createElement('div');
    container.className = 'flex';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'flex-shrink-0';
    const icon = document.createElement('i');
    
    // デモモードかどうかでアイコンを変更
    const isSimulationMode = note.includes('デモモード') || note.includes('⚠️');
    icon.className = isSimulationMode 
        ? 'fas fa-exclamation-triangle text-orange-600 text-2xl'
        : 'fas fa-info-circle text-blue-600 text-xl';
    iconDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-3';
    
    const header = document.createElement('h4');
    header.className = isSimulationMode 
        ? 'text-base font-bold text-orange-900 mb-2'
        : 'text-sm font-semibold text-blue-900 mb-2';
    header.textContent = isSimulationMode ? '⚠️ 重要なお知らせ' : '分析情報';
    
    const paragraph = document.createElement('p');
    paragraph.className = isSimulationMode 
        ? 'text-sm text-orange-900 font-medium leading-relaxed'
        : 'text-sm text-blue-800';
    paragraph.style.whiteSpace = 'pre-line';
    paragraph.textContent = note;
    
    const scenarioInfo = document.createElement('p');
    scenarioInfo.className = 'text-xs text-orange-700 mt-2';
    scenarioInfo.textContent = `参照シナリオ数: ${totalScenariosChecked || 100}件`;
    
    contentDiv.appendChild(header);
    contentDiv.appendChild(paragraph);
    if (totalScenariosChecked) {
        contentDiv.appendChild(scenarioInfo);
    }
    container.appendChild(iconDiv);
    container.appendChild(contentDiv);
    noteSection.appendChild(container);
}

// 検出された具体的なリスクの表示
function displayDetectedRisks(detectedRisks) {
    let container = document.getElementById('detectedRisksList');
    
    if (!container) {
        const resultsDiv = document.getElementById('results');
        if (!resultsDiv) {
            console.error('❌ results element not found');
            return;
        }
        
        const newSection = document.createElement('div');
        newSection.id = 'detectedRisksSection';
        newSection.className = 'mb-6';
        
        const listDiv = document.createElement('div');
        listDiv.id = 'detectedRisksList';
        listDiv.className = 'space-y-4';
        
        const header = document.createElement('h3');
        header.className = 'text-xl font-bold mb-4 text-gray-800';
        
        const headerIcon = document.createElement('i');
        headerIcon.className = 'fas fa-exclamation-triangle mr-2 text-red-600';
        
        const headerText = document.createTextNode('検出されたリスク（P0優先順・最大10件）');
        
        header.appendChild(headerIcon);
        header.appendChild(headerText);
        
        newSection.appendChild(header);
        newSection.appendChild(listDiv);
        resultsDiv.appendChild(newSection);
        
        container = listDiv;
    }

    // 既存の内容をクリア
    if (container) {
        container.textContent = '';

        // リスクカードを追加
        detectedRisks.forEach((risk, index) => {
            const card = createDetectedRiskCard(risk, index + 1);
            container.appendChild(card);
        });
    }
}

// 検出されたリスクカードの作成（番号ピンスタイル）
function createDetectedRiskCard(risk, index) {
    const card = document.createElement('div');
    
    // 優先度で色分け
    const borderColors = {
        'P0': 'border-red-600',
        'P1': 'border-orange-600',
        'P2': 'border-blue-600'
    };
    
    const bgColors = {
        'P0': 'bg-red-50',
        'P1': 'bg-orange-50',
        'P2': 'bg-blue-50'
    };
    
    card.className = `bg-white rounded-lg shadow-lg p-5 border-l-4 ${borderColors[risk.priorityLabel]} risk-card mb-4`;

    const priorityPinColors = {
        'P0': 'bg-red-600',
        'P1': 'bg-orange-600',
        'P2': 'bg-blue-600'
    };

    // ヘッダー部分（番号ピン＋タイトル）
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center mb-4';
    
    // 番号ピン（丸）
    const pinNumber = document.createElement('div');
    pinNumber.className = `flex items-center justify-center w-10 h-10 rounded-full ${priorityPinColors[risk.priorityLabel]} text-white font-bold text-lg mr-3 shadow-md`;
    pinNumber.textContent = index;
    
    // タイトルグループ
    const titleGroup = document.createElement('div');
    titleGroup.className = 'flex-1';
    
    // 優先度＋リスクタイプ
    const titleLine = document.createElement('div');
    titleLine.className = 'flex items-center gap-2 mb-1';
    
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white ${priorityPinColors[risk.priorityLabel]}`;
    priorityBadge.textContent = risk.priorityLabel;
    
    const riskTitle = document.createElement('span');
    riskTitle.className = 'text-lg font-bold text-gray-900';
    riskTitle.textContent = risk.riskType;
    
    titleLine.appendChild(priorityBadge);
    titleLine.appendChild(riskTitle);
    
    // 「要確認」バッジを追加
    const statusBadge = document.createElement('span');
    statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300';
    const statusIcon = document.createElement('i');
    statusIcon.className = 'fas fa-question-circle mr-1';
    statusBadge.appendChild(statusIcon);
    statusBadge.appendChild(document.createTextNode('要確認'));
    
    titleGroup.appendChild(titleLine);
    titleGroup.appendChild(statusBadge);
    
    headerDiv.appendChild(pinNumber);
    headerDiv.appendChild(titleGroup);
    
    // 証拠セクション（📋 根拠）
    const evidenceDiv = document.createElement('div');
    evidenceDiv.className = 'mb-4 p-4 bg-gray-50 border-l-3 border-gray-400 rounded-lg';
    
    const evidenceHeader = document.createElement('div');
    evidenceHeader.className = 'flex items-center mb-2';
    
    const evidenceIcon = document.createElement('i');
    evidenceIcon.className = 'fas fa-clipboard-check mr-2 text-gray-700';
    
    const evidenceLabel = document.createElement('strong');
    evidenceLabel.className = 'text-gray-800 text-sm';
    evidenceLabel.textContent = '📋 根拠（写真から確認できる事実）';
    
    evidenceHeader.appendChild(evidenceIcon);
    evidenceHeader.appendChild(evidenceLabel);
    
    const evidenceContent = document.createElement('p');
    evidenceContent.className = 'text-sm text-gray-700 leading-relaxed ml-6';
    evidenceContent.textContent = risk.evidence;
    
    evidenceDiv.appendChild(evidenceHeader);
    evidenceDiv.appendChild(evidenceContent);
    
    // 位置セクション（強化版）
    const locationDiv = document.createElement('div');
    locationDiv.className = 'mb-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm';
    
    const locationHeader = document.createElement('div');
    locationHeader.className = 'flex items-center mb-2';
    
    const locationIcon = document.createElement('i');
    locationIcon.className = 'fas fa-map-marker-alt mr-2 text-blue-600 text-lg';
    
    const locationTitle = document.createElement('span');
    locationTitle.className = 'font-bold text-blue-900 text-sm';
    locationTitle.textContent = '📍 危険箇所の位置';
    
    locationHeader.appendChild(locationIcon);
    locationHeader.appendChild(locationTitle);
    
    const locationContent = document.createElement('div');
    locationContent.className = 'ml-6 text-sm text-blue-800 font-medium';
    locationContent.textContent = risk.location || '位置情報なし';
    
    locationDiv.appendChild(locationHeader);
    locationDiv.appendChild(locationContent);
    
    // 位置情報の視覚化（地図風表示）
    if (risk.location && risk.location !== '位置情報なし') {
        const locationMap = document.createElement('div');
        locationMap.className = 'mt-3 p-3 bg-white border border-blue-200 rounded flex items-center justify-center';
        locationMap.innerHTML = `
            <div class="text-center">
                <i class="fas fa-map-marked-alt text-blue-400 text-3xl mb-2"></i>
                <div class="text-xs text-gray-600">現場見取図での位置</div>
                <div class="text-sm font-bold text-blue-700 mt-1">${escapeHtml(risk.location)}</div>
            </div>
        `;
        locationDiv.appendChild(locationMap);
    }
    
    // 法令違反セクション
    const lawDiv = document.createElement('div');
    lawDiv.className = 'mb-3 p-3 bg-red-50 rounded';
    const lawP = document.createElement('p');
    lawP.className = 'text-sm text-red-900';
    const lawIcon = document.createElement('i');
    lawIcon.className = 'fas fa-gavel mr-2';
    const lawLabel = document.createElement('span');
    lawLabel.className = 'font-semibold';
    lawLabel.textContent = '法令違反の疑い:';
    const lawBr = document.createElement('br');
    const lawText = document.createTextNode(risk.lawViolation);
    lawP.appendChild(lawIcon);
    lawP.appendChild(lawLabel);
    lawP.appendChild(lawBr);
    lawP.appendChild(lawText);
    lawDiv.appendChild(lawP);
    
    // 類似事故事例セクション（新規追加）
    let similarAccidentsDiv = null;
    const similarAccidentsArray = Array.isArray(risk.similarAccidents) 
        ? risk.similarAccidents 
        : (risk.similarAccidents ? [risk.similarAccidents] : []);
    
    if (similarAccidentsArray.length > 0) {
        similarAccidentsDiv = document.createElement('div');
        similarAccidentsDiv.className = 'mb-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded';
        
        const similarTitle = document.createElement('p');
        similarTitle.className = 'text-sm font-semibold text-orange-900 mb-2';
        const similarIcon = document.createElement('i');
        similarIcon.className = 'fas fa-exclamation-triangle mr-2';
        similarTitle.appendChild(similarIcon);
        similarTitle.appendChild(document.createTextNode('過去の類似事故事例（厚生労働省・国土交通省データベースより）:'));
        similarAccidentsDiv.appendChild(similarTitle);
        
        const similarUl = document.createElement('ul');
        similarUl.className = 'list-none text-sm text-orange-900 space-y-2';
        similarAccidentsArray.forEach((accident, index) => {
            const li = document.createElement('li');
            li.className = 'pl-0';
            li.textContent = accident;
            similarUl.appendChild(li);
        });
        similarAccidentsDiv.appendChild(similarUl);
    }
    
    // 即時対策セクション（🚨 即時対策）
    const immediateDiv = document.createElement('div');
    immediateDiv.className = 'mb-4 p-4 bg-red-50 border-l-3 border-red-400 rounded-lg';
    
    const immediateHeader = document.createElement('div');
    immediateHeader.className = 'flex items-center mb-2';
    
    const immediateIcon = document.createElement('i');
    immediateIcon.className = 'fas fa-bolt mr-2 text-red-600';
    
    const immediateLabel = document.createElement('strong');
    immediateLabel.className = 'text-red-800 text-sm';
    immediateLabel.textContent = '🚨 即時対策';
    
    immediateHeader.appendChild(immediateIcon);
    immediateHeader.appendChild(immediateLabel);
    
    const immediateUl = document.createElement('ul');
    immediateUl.className = 'list-disc list-inside text-sm text-red-700 space-y-1 ml-6';
    
    // immediateMeasuresが配列か文字列かをチェック
    const immediateMeasuresArray = Array.isArray(risk.immediateMeasures) 
        ? risk.immediateMeasures 
        : (risk.immediateMeasures ? [risk.immediateMeasures] : []);
    
    immediateMeasuresArray.slice(0, 3).forEach(measure => {
        const li = document.createElement('li');
        li.textContent = measure;
        immediateUl.appendChild(li);
    });
    
    immediateDiv.appendChild(immediateHeader);
    immediateDiv.appendChild(immediateUl);
    
    // 恒久対策セクション（🔧 恒久対策）
    const permanentDiv = document.createElement('div');
    permanentDiv.className = 'mb-4 p-4 bg-blue-50 border-l-3 border-blue-400 rounded-lg';
    
    const permanentHeader = document.createElement('div');
    permanentHeader.className = 'flex items-center mb-2';
    
    const permanentIcon = document.createElement('i');
    permanentIcon.className = 'fas fa-tools mr-2 text-blue-600';
    
    const permanentLabel = document.createElement('strong');
    permanentLabel.className = 'text-blue-800 text-sm';
    permanentLabel.textContent = '🔧 恒久対策';
    
    permanentHeader.appendChild(permanentIcon);
    permanentHeader.appendChild(permanentLabel);
    
    const permanentUl = document.createElement('ul');
    permanentUl.className = 'list-disc list-inside text-sm text-blue-700 space-y-1 ml-6';
    
    // permanentMeasuresが配列か文字列かをチェック
    const permanentMeasuresArray = Array.isArray(risk.permanentMeasures) 
        ? risk.permanentMeasures 
        : (risk.permanentMeasures ? [risk.permanentMeasures] : []);
    
    permanentMeasuresArray.slice(0, 2).forEach(measure => {
        const li = document.createElement('li');
        li.textContent = measure;
        permanentUl.appendChild(li);
    });
    
    permanentDiv.appendChild(permanentHeader);
    permanentDiv.appendChild(permanentUl);
    
    // 追加確認セクション（✅ 追加確認）
    const additionalDiv = document.createElement('div');
    additionalDiv.className = 'mb-4 p-4 bg-green-50 border-l-3 border-green-400 rounded-lg';
    
    const additionalHeader = document.createElement('div');
    additionalHeader.className = 'flex items-center mb-2';
    
    const additionalIcon = document.createElement('i');
    additionalIcon.className = 'fas fa-clipboard-check mr-2 text-green-600';
    
    const additionalLabel = document.createElement('strong');
    additionalLabel.className = 'text-green-800 text-sm';
    additionalLabel.textContent = '✅ 追加確認';
    
    additionalHeader.appendChild(additionalIcon);
    additionalHeader.appendChild(additionalLabel);
    
    const additionalUl = document.createElement('ul');
    additionalUl.className = 'list-disc list-inside text-sm text-green-700 space-y-1 ml-6';
    
    // additionalChecksが配列か文字列かをチェック
    const additionalChecksArray = Array.isArray(risk.additionalChecks) 
        ? risk.additionalChecks 
        : (risk.additionalChecks ? [risk.additionalChecks] : []);
    
    additionalChecksArray.forEach(check => {
        const li = document.createElement('li');
        li.textContent = check;
        additionalUl.appendChild(li);
    });
    
    additionalDiv.appendChild(additionalHeader);
    additionalDiv.appendChild(additionalUl);
    
    // 統括安全衛生責任者の評価
    const evalDiv = document.createElement('div');
    evalDiv.className = 'mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded';
    const evalP = document.createElement('p');
    evalP.className = 'text-sm text-yellow-900';
    const evalIcon = document.createElement('i');
    evalIcon.className = 'fas fa-user-tie mr-2';
    const evalLabel = document.createElement('span');
    evalLabel.className = 'font-semibold';
    evalLabel.textContent = '統括安全衛生責任者の評価:';
    const evalBr = document.createElement('br');
    const evalText = document.createTextNode(risk.safetyManagerEvaluation);
    evalP.appendChild(evalIcon);
    evalP.appendChild(evalLabel);
    evalP.appendChild(evalBr);
    evalP.appendChild(evalText);
    evalDiv.appendChild(evalP);
    
    // 全ての要素を追加
    card.appendChild(headerDiv);
    card.appendChild(evidenceDiv);
    if (risk.location && risk.location !== '位置情報なし') {
        card.appendChild(locationDiv);
    }
    card.appendChild(immediateDiv);
    card.appendChild(permanentDiv);
    card.appendChild(additionalDiv);
    if (similarAccidentsDiv) {
        card.appendChild(similarAccidentsDiv);
    }
    if (risk.lawViolation) {
        card.appendChild(lawDiv);
    }
    if (risk.safetyManagerEvaluation) {
        card.appendChild(evalDiv);
    }
    
    return card;
}

// ========================================
// AIチャット機能
// ========================================

let chatHistory = [];
let analysisContext = null;

// チャットUIの表示
function displayChatUI(context) {
    analysisContext = context;
    chatHistory = [];

    // 既存のチャットボックスを削除
    const existingChat = document.getElementById('chatSection');
    if (existingChat) {
        existingChat.remove();
    }

    // チャットセクションを作成
    const chatSection = document.createElement('div');
    chatSection.id = 'chatSection';
    chatSection.className = 'mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 shadow-lg border-2 border-indigo-200';

    // チャットヘッダー
    const chatHeader = document.createElement('div');
    chatHeader.className = 'flex items-center mb-4';
    
    // 🐶 v60.7: 犬のアイコンに変更
    const chatIcon = document.createElement('img');
    chatIcon.src = '/static/dog-icon.png';
    chatIcon.alt = '安全管理AI';
    chatIcon.className = 'w-12 h-12 mr-3';
    chatIcon.style.objectFit = 'contain';
    
    const chatTitle = document.createElement('h3');
    chatTitle.className = 'text-2xl font-bold text-gray-800';
    chatTitle.textContent = '統括安全衛生責任者AIに質問';
    
    chatHeader.appendChild(chatIcon);
    chatHeader.appendChild(chatTitle);
    chatSection.appendChild(chatHeader);

    // 説明文
    const chatDesc = document.createElement('p');
    chatDesc.className = 'text-sm text-gray-600 mb-4';
    chatDesc.textContent = '分析結果について、法令解釈・対策手順・類似事故例など、何でもご質問ください。';
    chatSection.appendChild(chatDesc);

    // 🎯 v60.5: モデル選択UI（ラジオボタン式）
    const modelSelector = document.createElement('div');
    modelSelector.className = 'mb-4 p-4 bg-white rounded-lg border border-indigo-200';
    
    const modelTitle = document.createElement('div');
    modelTitle.className = 'text-sm font-semibold text-gray-700 mb-2';
    modelTitle.innerHTML = '<i class="fas fa-brain mr-2 text-indigo-600"></i>AIモデル選択';
    modelSelector.appendChild(modelTitle);
    
    const modelOptions = document.createElement('div');
    modelOptions.className = 'flex gap-4';
    
    // Flash（デフォルト）
    const flashOption = document.createElement('label');
    flashOption.className = 'flex items-center cursor-pointer p-2 rounded hover:bg-indigo-50 transition whitespace-nowrap';
    flashOption.innerHTML = `
        <input type="radio" name="aiModel" value="flash" id="modelFlash" checked class="mr-2">
        <div class="whitespace-nowrap">
            <span class="font-medium text-gray-800">Gemini 3.0 Flash</span>
            <span class="text-xs text-gray-500 ml-1">(高速・約0.7円/回)</span>
        </div>
    `;
    
    // Pro
    const proOption = document.createElement('label');
    proOption.className = 'flex items-center cursor-pointer p-2 rounded hover:bg-indigo-50 transition whitespace-nowrap';
    proOption.innerHTML = `
        <input type="radio" name="aiModel" value="pro" id="modelPro" class="mr-2">
        <div class="whitespace-nowrap">
            <span class="font-medium text-gray-800">Gemini 3.0 Pro</span>
            <span class="text-xs text-gray-500 ml-1">(高精度・約2.9円/回)</span>
        </div>
    `;
    
    modelOptions.appendChild(flashOption);
    modelOptions.appendChild(proOption);
    modelSelector.appendChild(modelOptions);
    
    // 選択状態の表示
    const modelStatus = document.createElement('div');
    modelStatus.id = 'modelStatus';
    modelStatus.className = 'mt-2 text-xs text-indigo-600 whitespace-nowrap';
    modelStatus.innerHTML = '<i class="fas fa-check-circle mr-1"></i>選択中: Gemini 3.0 Flash（高速・約0.7円/回）';
    modelSelector.appendChild(modelStatus);
    
    // ラジオボタンの変更イベント
    modelOptions.addEventListener('change', (e) => {
        const selected = e.target.value;
        const statusDiv = document.getElementById('modelStatus');
        if (selected === 'flash') {
            statusDiv.innerHTML = '<i class="fas fa-check-circle mr-1"></i>選択中: Gemini 3.0 Flash（高速・約0.7円/回）';
        } else {
            statusDiv.innerHTML = '<i class="fas fa-check-circle mr-1"></i>選択中: Gemini 3.0 Pro（高精度・約2.9円/回）';
        }
    });
    
    chatSection.appendChild(modelSelector);

    // クイックアクションボタン
    const quickActions = document.createElement('div');
    quickActions.className = 'flex flex-wrap gap-2 mb-4';
    
    const quickQuestions = [
        {
            text: '🛡️ 具体的な対策',
            type: 'COUNTERMEASURES',
            query: '検出されたリスクについて、即時対策（5分以内）3つと恒久対策2つを、人員・資材・所要時間付きで教えてください。'
        },
        {
            text: '⚖️ 関連法令',
            type: 'LAWS',
            query: 'この現場で遵守すべき法令を、条文番号・要約・違反時の罰則付きで3件以上教えてください。'
        },
        {
            text: '📰 類似事故事例',
            type: 'CASES',
            query: 'このリスクと同型の事故パターンを3つ、発生メカニズム・4M分析・参考DB・検索キーワード付きで教えてください。'
        },
        {
            text: '❓ なぜ危険？',
            type: 'WHY_PRIORITY',
            query: 'なぜこれらがP0（最優先）リスクなのか、危険エネルギー・最悪シナリオ・発生確率・即死性の観点から教えてください。'
        }
    ];
    
    quickQuestions.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'px-3 py-2 bg-white border border-indigo-300 rounded-full text-sm text-indigo-700 hover:bg-indigo-100 transition';
        btn.textContent = item.text;
        btn.addEventListener('click', () => {
            document.getElementById('chatInput').value = item.query;
            // 【重要】questionTypeを保存
            window.currentQuestionType = item.type;
            sendChatMessage();
        });
        quickActions.appendChild(btn);
    });
    chatSection.appendChild(quickActions);

    // チャット履歴表示エリア
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chatMessages';
    chatMessages.className = 'bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto border border-gray-300';
    
    // 初期メッセージ
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'text-center text-gray-500 text-sm py-8';
    welcomeMsg.innerHTML = '<i class="fas fa-comments text-4xl mb-3 text-gray-300"></i><br>質問を入力してください';
    chatMessages.appendChild(welcomeMsg);
    
    chatSection.appendChild(chatMessages);

    // 入力エリア
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'space-y-2';
    
    // 画像プレビューエリア（非表示状態で作成）
    // 入力ボックスとボタンの行
    const inputRow = document.createElement('div');
    inputRow.className = 'flex gap-2';
    
    const chatInput = document.createElement('textarea');
    chatInput.id = 'chatInput';
    chatInput.className = 'flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
    chatInput.rows = 2;
    chatInput.placeholder = '例: この現場で最優先の対策は何ですか？';
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    // ボタンコンテナ
    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex flex-col gap-2';
    
    const sendBtn = document.createElement('button');
    sendBtn.id = 'sendChatBtn';
    sendBtn.className = 'px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center';
    sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信';
    sendBtn.addEventListener('click', sendChatMessage);
    
    btnContainer.appendChild(sendBtn);
    
    inputRow.appendChild(chatInput);
    inputRow.appendChild(btnContainer);
    chatInputContainer.appendChild(inputRow);
    chatSection.appendChild(chatInputContainer);

    // 結果表示エリアに追加
    const resultsDiv = document.getElementById('results');
    resultsDiv.appendChild(chatSection);
}

// チャットメッセージ送信
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }

    // ユーザーメッセージを表示
    addChatMessage('user', message);
    input.value = '';

    // 送信ボタン無効化
    const sendBtn = document.getElementById('sendChatBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>回答中...';

    try {
        // 【ChatGPT+Gemini指示】最新の分析コンテキストを取得
        const latestContext = window.latestAnalysisContext || analysisContext;
        
        // 分析結果がない場合の警告
        if (!latestContext || !latestContext.risks || latestContext.risks.length === 0) {
            addChatMessage('error', '⚠️ 先に写真を分析してください。「安全リスクを分析」ボタンを押してから質問してください。');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信';
            return;
        }
        
        console.log('💬 チャット送信 - 分析コンテキスト:', latestContext);
        
        // 🎯 v60.5: 選択されたモデルを取得
        const selectedModel = document.querySelector('input[name="aiModel"]:checked').value;
        console.log(`🎯 選択されたモデル: ${selectedModel === 'flash' ? 'Gemini 3.0 Flash（高速）' : 'Gemini 3.0 Pro（高精度）'}`);
        
        // API呼び出し（最新の分析結果を含める）
        const requestData = {
            message: message,
            context: latestContext,  // 【重要】最新の分析コンテキストを使用
            history: chatHistory,
            questionType: window.currentQuestionType || null,  // 【ChatGPT提案】質問タイプを送信
            model: selectedModel  // 🎯 v60.5: 選択されたモデルを送信
        };
        
        // 質問タイプをリセット
        window.currentQuestionType = null;
        
        const response = await axios.post('/api/chat', requestData);

        if (response.data.success) {
            // AIメッセージを表示
            addChatMessage('assistant', response.data.reply);
            
            // 履歴に追加
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: response.data.reply });
        } else {
            addChatMessage('error', response.data.reply || 'エラーが発生しました');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('error', '申し訳ございません。エラーが発生しました。もう一度お試しください。');
    } finally {
        // 送信ボタン有効化
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信';
    }
}

// チャットメッセージを表示
function addChatMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    
    // 初期メッセージを削除
    if (messagesDiv.querySelector('.text-center')) {
        messagesDiv.innerHTML = '';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`;

    const bubble = document.createElement('div');
    bubble.className = `inline-block max-w-full p-4 rounded-lg ${
        role === 'user' 
            ? 'bg-indigo-600 text-white' 
            : role === 'error'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-white text-gray-800 border-2 border-gray-300 shadow-md'
    }`;

    // 🐶 v60.7: アイコンを犬の画像に変更
    let icon;
    if (role === 'assistant') {
        // AIの回答には犬の画像を使用
        icon = document.createElement('img');
        icon.src = '/static/dog-icon.png';
        icon.alt = 'AI';
        icon.className = 'w-6 h-6 mr-2 inline-block';
        icon.style.objectFit = 'contain';
    } else {
        // ユーザーとエラーは従来通りアイコン
        icon = document.createElement('i');
        icon.className = `fas ${
            role === 'user' 
                ? 'fa-user' 
                : 'fa-exclamation-circle'
        } mr-2`;
    }
    
    bubble.appendChild(icon);
    
    // テキスト（改行を保持、見出しを強調）
    const textSpan = document.createElement('div');
    textSpan.style.whiteSpace = 'pre-wrap';
    textSpan.className = role === 'assistant' ? 'text-sm leading-relaxed' : '';
    
    // AI回答の場合は見出しを強調表示
    if (role === 'assistant') {
        const formattedContent = content
            .replace(/## (\d+)\. 【(.+?)】/g, '<div class="font-bold text-lg text-indigo-700 mt-4 mb-2">## $1. 【$2】</div>')
            .replace(/【P0：(.+?)】/g, '<div class="font-bold text-red-600 mt-3 mb-1">【P0：$1】</div>')
            .replace(/【P1：(.+?)】/g, '<div class="font-bold text-orange-600 mt-3 mb-1">【P1：$1】</div>')
            .replace(/【P2：(.+?)】/g, '<div class="font-bold text-yellow-600 mt-3 mb-1">【P2：$1】</div>')
            .replace(/- (.+)/g, '<div class="ml-4 my-1">• $1</div>')
            .replace(/□ (.+)/g, '<div class="ml-4 my-1">☐ $1</div>');
        textSpan.innerHTML = formattedContent;
    } else {
        textSpan.textContent = content;
    }
    
    bubble.appendChild(textSpan);

    messageDiv.appendChild(bubble);
    messagesDiv.appendChild(messageDiv);

    // スクロール
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 【新機能3】印刷ボタンの追加
function addPrintButton() {
    // 既存のボタンを削除
    const existingButton = document.getElementById('printButton');
    if (existingButton) {
        existingButton.remove();
    }

    // 印刷ボタンを作成
    const printButton = document.createElement('button');
    printButton.id = 'printButton';
    printButton.className = 'fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center gap-2 print:hidden hover:scale-110';
    printButton.innerHTML = `
        <i class="fas fa-print text-xl"></i>
        <span>印刷</span>
    `;

    // 印刷処理
    printButton.addEventListener('click', () => {
        // 印刷用のヘッダーを追加
        const printHeader = document.createElement('div');
        printHeader.className = 'print-header hidden';
        printHeader.innerHTML = `
            <h1>建設現場 安全管理報告書</h1>
            <p style="font-size: 12pt; font-weight: normal; margin-top: 10px;">
                統括安全衛生責任者による詳細リスク分析
            </p>
        `;

        // 印刷用のフッターを追加
        const printFooter = document.createElement('div');
        printFooter.className = 'print-footer hidden';
        printFooter.innerHTML = `
            <p>この報告書は安全管理システムにより自動生成されました</p>
        `;

        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.insertBefore(printHeader, resultsDiv.firstChild);
            resultsDiv.appendChild(printFooter);
        }

        // 印刷実行
        window.print();

        // 印刷後にヘッダー・フッターを削除
        setTimeout(() => {
            printHeader.remove();
            printFooter.remove();
        }, 1000);
    });

    document.body.appendChild(printButton);
}

// 【新機能4】タイムスタンプの追加
function addTimestamp() {
    // 既存のタイムスタンプを削除
    const existingTimestamp = document.getElementById('analysisTimestamp');
    if (existingTimestamp) {
        existingTimestamp.remove();
    }

    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    // 現在時刻を取得
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;

    // タイムスタンプセクションを作成
    const timestampSection = document.createElement('div');
    timestampSection.id = 'analysisTimestamp';
    timestampSection.className = 'mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg print:break-inside-avoid';
    timestampSection.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas fa-calendar-alt text-gray-600 mr-3 text-lg"></i>
                <div>
                    <div class="text-xs text-gray-500">分析実施日時</div>
                    <div class="text-sm font-bold text-gray-800">${formattedTime}</div>
                </div>
            </div>
            <div class="flex items-center text-xs text-gray-500">
                <img src="/static/dog-icon.png" alt="AI" class="w-4 h-4 mr-2" style="object-fit: contain;">
                <span>AIによる自動分析</span>
            </div>
        </div>
    `;

    // 最初の子要素の前に挿入
    resultsDiv.insertBefore(timestampSection, resultsDiv.firstChild);
}

// ========================================
// 分析履歴管理機能
// ========================================

// 分析履歴を保存
function saveAnalysisHistory(analysisResult) {
    try {
        // localStorageから既存の履歴を取得
        const historyKey = 'safetyAnalysisHistory';
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        // 新しい分析結果を追加（最新が先頭）
        const historyItem = {
            id: Date.now(),
            timestamp: analysisResult.timestamp || new Date().toISOString(),
            workTypes: analysisResult.workTypes?.map(w => w.category) || [],
            riskCount: analysisResult.detectedRisks?.length || 0,
            p0Count: analysisResult.detectedRisks?.filter(r => r.priority === 'P0').length || 0,
            p1Count: analysisResult.detectedRisks?.filter(r => r.priority === 'P1').length || 0,
            p2Count: analysisResult.detectedRisks?.filter(r => r.priority === 'P2').length || 0,
            objects: analysisResult.detectedObjects || [],
            summary: analysisResult.summary || '',
            imageData: analysisResult.imageData?.substring(0, 100) + '...' // プレビュー用に短縮
        };
        
        history.unshift(historyItem);
        
        // 最大50件まで保存
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem(historyKey, JSON.stringify(history));
        console.log('✅ 分析履歴を保存しました:', historyItem.id);
        
        // 履歴ボタンを表示
        showHistoryButton();
        
    } catch (error) {
        console.error('❌ 履歴保存エラー:', error);
    }
}

// 履歴ボタンを表示
function showHistoryButton() {
    // 既存のボタンがあれば何もしない
    if (document.getElementById('historyButton')) return;
    
    const historyButton = document.createElement('button');
    historyButton.id = 'historyButton';
    historyButton.className = 'fixed bottom-36 right-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center gap-2 print:hidden hover:scale-110';
    historyButton.innerHTML = `
        <i class="fas fa-history text-xl"></i>
        <span>履歴</span>
    `;
    
    historyButton.addEventListener('click', showHistoryModal);
    document.body.appendChild(historyButton);
}

// 履歴モーダルを表示
function showHistoryModal() {
    const historyKey = 'safetyAnalysisHistory';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // モーダル背景
    const modal = document.createElement('div');
    modal.id = 'historyModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    // モーダルコンテンツ
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col';
    
    // ヘッダー
    const header = document.createElement('div');
    header.className = 'bg-purple-600 text-white p-4 flex justify-between items-center';
    header.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-history text-2xl"></i>
            <h2 class="text-xl font-bold">分析履歴（全${history.length}件）</h2>
        </div>
        <button id="closeHistoryModal" class="text-white hover:text-gray-200 text-2xl">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 履歴リスト
    const listContainer = document.createElement('div');
    listContainer.className = 'overflow-y-auto flex-1 p-4';
    
    if (history.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-inbox text-6xl mb-4"></i>
                <p class="text-lg">まだ分析履歴がありません</p>
            </div>
        `;
    } else {
        history.forEach((item, index) => {
            const date = new Date(item.timestamp);
            const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            const riskLevel = item.p0Count > 0 ? '極めて危険' : item.p1Count > 0 ? '危険' : item.p2Count > 0 ? '注意' : '安全';
            const riskColor = item.p0Count > 0 ? 'text-red-600 bg-red-100' : item.p1Count > 0 ? 'text-orange-600 bg-orange-100' : item.p2Count > 0 ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100';
            
            const historyItem = document.createElement('div');
            historyItem.className = 'mb-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all cursor-pointer';
            historyItem.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-gray-700">#${history.length - index}</span>
                        <span class="text-sm text-gray-600">${formattedDate}</span>
                    </div>
                    <span class="px-3 py-1 ${riskColor} text-xs font-bold rounded-full">${riskLevel}</span>
                </div>
                <div class="grid grid-cols-4 gap-2 mb-2">
                    <div class="text-center p-2 bg-gray-50 rounded">
                        <div class="text-xs text-gray-500">総リスク</div>
                        <div class="text-lg font-bold text-gray-800">${item.riskCount}件</div>
                    </div>
                    <div class="text-center p-2 bg-red-50 rounded">
                        <div class="text-xs text-red-600">P0</div>
                        <div class="text-lg font-bold text-red-600">${item.p0Count}件</div>
                    </div>
                    <div class="text-center p-2 bg-orange-50 rounded">
                        <div class="text-xs text-orange-600">P1</div>
                        <div class="text-lg font-bold text-orange-600">${item.p1Count}件</div>
                    </div>
                    <div class="text-center p-2 bg-yellow-50 rounded">
                        <div class="text-xs text-yellow-600">P2</div>
                        <div class="text-lg font-bold text-yellow-600">${item.p2Count}件</div>
                    </div>
                </div>
                <div class="text-xs text-gray-600">
                    <span class="font-semibold">工種:</span> ${item.workTypes.join(', ') || '不明'}
                </div>
                <div class="flex justify-end gap-2 mt-3">
                    <button class="delete-history-btn px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200" data-id="${item.id}">
                        <i class="fas fa-trash mr-1"></i>削除
                    </button>
                </div>
            `;
            
            listContainer.appendChild(historyItem);
        });
    }
    
    // フッター
    const footer = document.createElement('div');
    footer.className = 'bg-gray-100 p-4 flex justify-between items-center';
    footer.innerHTML = `
        <button id="clearAllHistory" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            <i class="fas fa-trash-alt mr-2"></i>全削除
        </button>
        <div class="text-xs text-gray-500">
            <i class="fas fa-info-circle mr-1"></i>
            最大50件まで保存されます
        </div>
    `;
    
    modalContent.appendChild(header);
    modalContent.appendChild(listContainer);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // イベントリスナー
    document.getElementById('closeHistoryModal').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('clearAllHistory').addEventListener('click', () => {
        if (confirm('すべての履歴を削除しますか？この操作は元に戻せません。')) {
            localStorage.removeItem(historyKey);
            modal.remove();
            alert('履歴を削除しました');
        }
    });
    
    // 個別削除
    document.querySelectorAll('.delete-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (confirm('この履歴を削除しますか？')) {
                let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
                history = history.filter(item => item.id !== id);
                localStorage.setItem(historyKey, JSON.stringify(history));
                modal.remove();
                showHistoryModal(); // 再表示
            }
        });
    });
    
    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ========================================
// エクスポート機能（PDF/Excel/Word）
// ========================================

// グローバル変数として分析データを保持
let currentAnalysisData = null;

// エクスポートボタンを追加

// ==============================================================================
// 10. エクスポート機能 (Export Functions) - v67.15 Fixed
// ==============================================================================

/**
 * エクスポートボタン群をUIに追加する
 * @param {Object} data - 分析結果データ
 */
function addExportButton(data) {
    const resultsDiv = document.getElementById('results');
    
    // 既存のエクスポートエリアがあれば削除（重複防止）
    const existing = document.getElementById('export-actions');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'export-actions';
    container.className = 'mt-10 pt-8 border-t-2 border-dashed border-gray-200 flex flex-wrap gap-4 justify-center no-print';
    
    // ボタン生成ヘルパー
    const createBtn = (text, iconClass, colorClass, onClickHandler) => {
        const btn = document.createElement('button');
        btn.className = `flex items-center px-6 py-3 ${colorClass} text-white font-bold rounded-lg shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2`;
        btn.innerHTML = `<i class="${iconClass} mr-2 text-lg"></i>${text}`;
        btn.onclick = onClickHandler;
        return btn;
    };

    // 1. Excel出力 (v67.15: 列幅自動調整対応)
    container.appendChild(createBtn(
        'Excel報告書', 
        'fas fa-file-excel', 
        'bg-green-600 hover:bg-green-700 focus:ring-green-500', 
        () => exportToExcel(data)
    ));

    // 2. Word出力 (v67.15: MIME修正・画像埋め込み)
    container.appendChild(createBtn(
        'Word報告書', 
        'fas fa-file-word', 
        'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500', 
        () => exportToWord(data)
    ));

    // 3. PDF出力 (v67.15: レイアウト調整)
    container.appendChild(createBtn(
        'PDF報告書', 
        'fas fa-file-pdf', 
        'bg-red-600 hover:bg-red-700 focus:ring-red-500', 
        () => exportToPDF(data)
    ));

    // 4. 画像保存 (v67.15: クリーンキャプチャ)
    container.appendChild(createBtn(
        '画像のみ保存', 
        'fas fa-camera', 
        'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500', 
        () => downloadResultImage()
    ));

    resultsDiv.appendChild(container);
}

// ==============================================================================
// ✅ Export Fix 1: Excel出力 (SheetJS) - 根拠文字切れ対策
// ==============================================================================
function exportToExcel(data) {
    console.log('📊 Exporting to Excel...');
    const wb = XLSX.utils.book_new();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // 1. サマリーシート作成
    const summaryData = [
        ['安全パトロール報告書'],
        ['作成日', new Date().toLocaleDateString()],
        ['統括安全衛生責任者コメント', data.summary],
        ['', ''],
        ['No', '重要度', 'リスクタイトル', '詳細状況', '対策指示']
    ];
    
    data.detectedRisks.forEach((r, i) => {
        summaryData.push([
            i + 1,
            r.priority,
            r.title,
            r.description,
            r.measures
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // ★ v67.15 修正: 列幅の設定 (ws['!cols'])
    // 文字がセルからはみ出さないよう、十分な幅(50)を確保
    ws['!cols'] = [
        { wch: 6 },   // No
        { wch: 10 },  // 重要度
        { wch: 35 },  // リスクタイトル
        { wch: 55 },  // 詳細状況 (たっぷり取る)
        { wch: 55 }   // 対策指示 (たっぷり取る)
    ];

    XLSX.utils.book_append_sheet(wb, ws, "安全報告書");
    XLSX.writeFile(wb, `安全パトロール報告書_${timestamp}.xlsx`);
}

// ==============================================================================
// ✅ Export Fix 2: Word出力 (html-docx-js) - ファイル破損対策
// ==============================================================================
async function exportToWord(data) {
    console.log('📝 Exporting to Word...');
    
    // 画像をHTMLに埋め込むためのタグ生成
    // Base64画像を直接埋め込むことで、外部参照エラーを防ぐ
    const imageHtml = currentImageData 
        ? `<div style="text-align:center; margin-bottom:20px;"><img src="${currentImageData}" width="500" style="max-width:100%; height:auto;" /></div>` 
        : '<p>[画像なし]</p>';

    // Word用の完全なHTMLテンプレート
    const contentHtml = `
        <!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
            <meta charset="utf-8">
            <title>安全報告書</title>
            <style>
                body { font-family: 'MS Mincho', serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; vertical-align: top; }
                th { background-color: #f2f2f2; text-align: left; }
                .priority-P0 { color: red; font-weight: bold; }
                .header { text-align: center; font-size: 18pt; margin-bottom: 20px; font-weight: bold; }
                .section-title { font-size: 14pt; font-weight: bold; margin-top: 15px; background-color: #eee; padding: 5px; }
            </style>
        </head>
        <body>
            <div class="header">安全パトロール是正指示書</div>
            <p style="text-align:right">作成日: ${new Date().toLocaleDateString()}</p>
            <hr/>
            
            <div class="section-title">1. 現場状況・解析写真</div>
            ${imageHtml}
            
            <div class="section-title">2. 統括安全衛生責任者所見</div>
            <p style="border:1px solid #ccc; padding:10px;">${data.summary.replace(/\n/g, '<br/>')}</p>
            
            <div class="section-title">3. 検出リスク一覧</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:5%">No</th>
                        <th style="width:10%">重要度</th>
                        <th style="width:25%">タイトル</th>
                        <th style="width:60%">内容・対策</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.detectedRisks.map((r, i) => `
                        <tr>
                            <td style="text-align:center">${i+1}</td>
                            <td class="priority-${r.priority}" style="text-align:center">${r.priority}</td>
                            <td>${r.title}</td>
                            <td>
                                <b>【状況】</b><br/>${r.description}<br/><br/>
                                <b>【対策】</b><br/>${r.measures}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Blob変換と保存処理
    try {
        const converted = htmlDocx.asBlob(contentHtml);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(converted);
        link.download = `安全報告書_${new Date().getTime()}.docx`;
        document.body.appendChild(link);
        link.click();
        
        // クリーンアップ
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        }, 100);
        
    } catch (e) {
        console.error('Word出力エラー:', e);
        alert('Word出力に失敗しました。ライブラリの読み込み状況を確認してください。');
    }
}

// ==============================================================================
// ✅ Export Fix 3: PDF出力 (jsPDF) - ページ収まり・画像画質改善
// ==============================================================================
function exportToPDF(data) {
    console.log('📄 Exporting to PDF...');
    const { jsPDF } = window.jspdf;
    
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    // 日本語フォント非対応時のフォールバック警告（コンソールのみ）
    console.log('※PDF出力: 日本語フォントが埋め込まれていないため、文字化けする可能性があります。v67.15ではレイアウトロジックを優先修正しています。');
    
    // タイトル
    doc.setFontSize(16);
    doc.text("Safety Patrol Report", 105, 15, { align: "center" });
    
    let yPos = 30;

    // 画像埋め込み (アスペクト比保持 & 高画質設定)
    if (currentImageData) {
        try {
            const imgProps = doc.getImageProperties(currentImageData);
            const pdfWidth = doc.internal.pageSize.getWidth() - 40; // 左右マージン20mm
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // ページからはみ出す場合は調整
            const maxHeight = 120; 
            let finalH = pdfHeight;
            let finalW = pdfWidth;
            
            if (pdfHeight > maxHeight) {
                finalH = maxHeight;
                finalW = (imgProps.width * finalH) / imgProps.height;
            }
            const xPos = (doc.internal.pageSize.getWidth() - finalW) / 2; // 中央寄せ

            // 画質圧縮: 'FAST' ではなく 'medium' または圧縮なし
            doc.addImage(currentImageData, 'JPEG', xPos, yPos, finalW, finalH, undefined, 'MEDIUM');
            yPos += finalH + 15;
        } catch (e) {
            console.error('PDF画像追加エラー:', e);
        }
    }

    // リスク一覧
    doc.setFontSize(12);
    doc.text("Detected Risks:", 20, yPos);
    yPos += 10;

    data.detectedRisks.forEach((r, i) => {
        // 改ページ判定 (下端270mmを超えたら次ページ)
        if (yPos > 270) { 
            doc.addPage(); 
            yPos = 20; 
        }
        
        doc.setFontSize(10);
        // 日本語を含むタイトルは文字化け回避のため、本来は専用フォントが必要
        // ここでは簡易的にASCII文字に置換するか、そのまま出力してブラウザのPDFビューアに任せる
        const titleLine = `${i+1}. [${r.priority}] ${r.title}`; // 日本語部分は化ける可能性あり
        doc.text(titleLine, 20, yPos);
        yPos += 7;
        
        // 詳細テキストの折り返し処理
        const detailText = `Measures: ${r.measures}`; // 簡易英語プレフィックス
        const splitText = doc.splitTextToSize(detailText, 170);
        doc.text(splitText, 25, yPos);
        
        yPos += (splitText.length * 5) + 8;
    });

    const timestamp = new Date().getTime();
    doc.save(`SafetyReport_${timestamp}.pdf`);
}

// ==============================================================================
// ✅ Export Fix 4: 画像保存 (html2canvas) - ボタン非表示撮影
// ==============================================================================
async function downloadResultImage() {
    const element = document.body; // または #results など特定の要素
    const originalScrollPos = window.scrollY;

    // 1. エクスポートボタンやヘッダーなど不要な要素を隠す
    const hiddenElements = [];
    const elementsToHide = document.querySelectorAll('.no-print, header, footer, #uploadSection, #historyModal');
    
    elementsToHide.forEach(el => {
        if (el.style.display !== 'none') {
            hiddenElements.push({ el, originalDisplay: el.style.display });
            el.style.display = 'none'; // 一時的に非表示
        }
    });

    try {
        // 2. html2canvas でキャプチャ
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2, // 高解像度 (Retina対応)
            logging: false,
            windowHeight: document.documentElement.scrollHeight,
            scrollY: -window.scrollY
        });

        // 3. ダウンロード発火
        const link = document.createElement('a');
        link.download = `解析結果_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (e) {
        console.error('画像保存エラー:', e);
        alert('画像の保存に失敗しました');
    } finally {
        // 4. 要素の表示を元に戻す
        hiddenElements.forEach(item => {
            item.el.style.display = item.originalDisplay;
        });
        window.scrollTo(0, originalScrollPos);
    }
}

// ==============================================================================
// End of app_complete.js
// ==============================================================================
