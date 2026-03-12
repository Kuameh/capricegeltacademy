/* ============================================
   Course Viewer — Lesson Navigation & Video Player
   ============================================ */

let currentCourse = null;
let currentEnrollment = null;
let allLessons = [];
let currentLessonIndex = -1;

window.addEventListener('cga:auth-ready', async (e) => {
    const user = e.detail;

    // Set user info
    const displayName = user.displayName || user.email.split('@')[0];
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent = displayName;

    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('courseId');
    const enrollmentId = params.get('enrollmentId');

    if (!courseId || !enrollmentId) {
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        // Verify enrollment
        const enrollDoc = await db.collection('enrollments').doc(enrollmentId).get();
        if (!enrollDoc.exists || enrollDoc.data().userId !== user.uid) {
            window.location.href = 'dashboard.html';
            return;
        }

        currentEnrollment = { id: enrollDoc.id, ...enrollDoc.data() };

        // Check access window
        const endDate = currentEnrollment.endDate ? currentEnrollment.endDate.toDate() : null;
        if (endDate && endDate < new Date()) {
            window.location.href = 'dashboard.html';
            return;
        }

        // Fetch course
        const courseDoc = await db.collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            window.location.href = 'dashboard.html';
            return;
        }

        currentCourse = courseDoc.data();
        document.getElementById('course-title').textContent = currentCourse.name || courseId.toUpperCase();

        // Flatten lessons
        allLessons = [];
        (currentCourse.modules || []).forEach(mod => {
            (mod.lessons || []).forEach(lesson => {
                allLessons.push({ ...lesson, moduleName: mod.title, moduleId: mod.id });
            });
        });

        renderSidebar();
        updateProgress();

        // Auto-select first incomplete lesson or first lesson
        const progress = currentEnrollment.progress || {};
        const firstIncomplete = allLessons.findIndex(l => !progress[l.id] || !progress[l.id].completed);
        selectLesson(firstIncomplete >= 0 ? firstIncomplete : 0);

    } catch (err) {
        console.error('Course viewer error:', err);
        document.getElementById('lesson-title').textContent = 'Error loading course';
        document.getElementById('lesson-description').textContent = 'Please go back to the dashboard and try again.';
    }
});

function renderSidebar() {
    const container = document.getElementById('modules-list');
    const progress = currentEnrollment.progress || {};

    const html = (currentCourse.modules || []).map((mod, modIdx) => {
        const lessonsHtml = (mod.lessons || []).map(lesson => {
            const isCompleted = progress[lesson.id] && progress[lesson.id].completed;
            const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
            const duration = lesson.durationMinutes ? `${lesson.durationMinutes}m` : '';

            return `
                <div class="lesson-item ${isCompleted ? 'completed' : ''}" data-index="${globalIdx}" onclick="selectLesson(${globalIdx})">
                    <span class="lesson-check">${isCompleted ? '◆' : '◇'}</span>
                    <span>${lesson.title}</span>
                    <span class="lesson-duration">${duration}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="module-group">
                <div class="module-title expanded" onclick="toggleModule(this)">
                    <span>${mod.title || `Module ${modIdx + 1}`}</span>
                    <span class="chevron">▸</span>
                </div>
                <div class="lesson-list show">
                    ${lessonsHtml}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function toggleModule(el) {
    el.classList.toggle('expanded');
    const list = el.nextElementSibling;
    list.classList.toggle('show');
}

function selectLesson(index) {
    if (index < 0 || index >= allLessons.length) return;

    currentLessonIndex = index;
    const lesson = allLessons[index];

    // Update active state in sidebar
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.lesson-item[data-index="${index}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Update lesson info
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-description').textContent = lesson.description || '';

    // Update video
    const video = document.getElementById('lesson-video');
    const placeholder = document.getElementById('video-placeholder');

    if (lesson.videoUrl) {
        placeholder.style.display = 'none';
        video.style.display = 'block';
        video.src = lesson.videoUrl;
        video.load();
    } else {
        video.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
            <div class="placeholder-icon">🎬</div>
            <p>Video content coming soon</p>
            <p style="font-size: 12px; color: var(--text-tertiary);">${lesson.title}</p>
        `;
    }

    // Update nav buttons
    document.getElementById('btn-prev').disabled = index <= 0;
    document.getElementById('btn-next').disabled = index >= allLessons.length - 1;
}

function updateProgress() {
    const progress = currentEnrollment.progress || {};
    const completedCount = allLessons.filter(l => progress[l.id] && progress[l.id].completed).length;
    const pct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
    document.getElementById('course-progress').textContent = `${pct}% complete — ${completedCount}/${allLessons.length} lessons`;
}

// Video progress tracking — mark lesson complete at 90%
(function () {
    const video = document.getElementById('lesson-video');
    if (!video) return;

    let markedComplete = false;

    video.addEventListener('timeupdate', async () => {
        if (markedComplete || !video.duration || currentLessonIndex < 0) return;

        const pct = video.currentTime / video.duration;
        if (pct >= 0.9) {
            markedComplete = true;
            const lesson = allLessons[currentLessonIndex];

            try {
                const progressUpdate = {};
                progressUpdate[`progress.${lesson.id}`] = {
                    completed: true,
                    watchedSeconds: Math.round(video.currentTime),
                    lastWatched: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Calculate new totals
                const existingProgress = currentEnrollment.progress || {};
                existingProgress[lesson.id] = { completed: true };
                const completedCount = allLessons.filter(l => existingProgress[l.id] && existingProgress[l.id].completed).length;

                progressUpdate.completedLessons = completedCount;
                progressUpdate.totalLessons = allLessons.length;
                progressUpdate.percentComplete = Math.round((completedCount / allLessons.length) * 100);
                progressUpdate.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                await db.collection('enrollments').doc(currentEnrollment.id).update(progressUpdate);

                // Update local state
                currentEnrollment.progress = existingProgress;
                currentEnrollment.completedLessons = completedCount;
                currentEnrollment.percentComplete = progressUpdate.percentComplete;

                // Refresh sidebar and progress
                renderSidebar();
                updateProgress();

                // Re-highlight active
                const activeItem = document.querySelector(`.lesson-item[data-index="${currentLessonIndex}"]`);
                if (activeItem) activeItem.classList.add('active');

            } catch (err) {
                console.error('Progress update error:', err);
                markedComplete = false;
            }
        }
    });

    // Reset marker on lesson change
    const origSelect = window.selectLesson;
    window.selectLesson = function (idx) {
        markedComplete = false;
        origSelect(idx);
    };
})();

// Navigation buttons
document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentLessonIndex > 0) selectLesson(currentLessonIndex - 1);
});

document.getElementById('btn-next').addEventListener('click', () => {
    if (currentLessonIndex < allLessons.length - 1) selectLesson(currentLessonIndex + 1);
});
