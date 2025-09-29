// hlelp

document.addEventListener('DOMContentLoaded', function () {
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    const musicPlayer = document.getElementById('musicPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const timeline = document.getElementById('timeline');
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineHandle = document.getElementById('timelineHandle');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const songTitle = document.getElementById('songTitle');
    const description = document.getElementById('description');

    const bgVideo = document.getElementById('bgVideo');
    const bgImage = document.getElementById('bgImage');
    const litecoinBtn = document.querySelector('.litecoin-copy');
    const discordBtn = document.querySelector('.discord-copy');
    const copyNotification = document.getElementById('copyNotification');
    const notificationText = document.getElementById('notificationText');

    let currentBg = 'background1.png';

    // ========================================
    // TYPEWRITER DESCRIPTION ANIMATION
    // ========================================
    // Creates a looping typewriter effect that cycles through descriptions
    // CUSTOMIZABLE OPTIONS:
    // - descriptions array: Add/change your description texts
    // - typeSpeed (100): Typing speed in milliseconds (lower = faster)
    // - erasing speed (50): Erasing speed in milliseconds (lower = faster)
    // - pause after typing (2000): How long to show complete text before erasing
    // - pause after erasing (500): How long to wait before typing next description
    // - initial delay (1000): How long to wait before starting animation
    function typeDescription() {
        const descriptions = [
            "cmd.exe",
            "python.py",    // CHANGE THIS: Your second description
            "NanoLux company"
        ];

        let currentDescIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentDesc = descriptions[currentDescIndex];

            if (isDeleting) {
                description.textContent = currentDesc.substring(0, charIndex - 1);
                charIndex--;
            } else {
                description.textContent = currentDesc.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = 120;    // CHANGE THIS: Typing speed (lower = faster)
            if (isDeleting) {
                typeSpeed = 50;     // CHANGE THIS: Erasing speed (lower = faster)
            }

            if (!isDeleting && charIndex === currentDesc.length) {
                typeSpeed = 2000;   // CHANGE THIS: Pause after typing complete (milliseconds)
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentDescIndex = (currentDescIndex + 1) % descriptions.length;
                typeSpeed = 500;    // CHANGE THIS: Pause before typing next description
            }

            setTimeout(typeEffect, typeSpeed);
        }

        setTimeout(typeEffect, 1000); // CHANGE THIS: Initial delay before animation starts
    }

    function initBackgroundCycling() {
        const backgrounds = [
            'background1.png'
        ];

        let currentIndex = 0;

        function cycleBackground() {
            const newBg = backgrounds[currentIndex];

            // Create a temporary image to test loading
            const testImg = new Image();
            testImg.onload = function () {
                // Image loaded successfully, now update the background
                currentBg = newBg;
                bgImage.src = currentBg;
                bgImage.classList.add('active');
                bgVideo.classList.remove('active');
            };

            testImg.onerror = function () {
                console.error(`Failed to load background: ${newBg}`);
            };

            // Start loading the test image
            testImg.src = newBg;

            // Move to next background for next cycle
            currentIndex = (currentIndex + 1) % backgrounds.length;
        }
        

        // Start with first background immediately
        cycleBackground();
        document.getElementById('cycle1').addEventListener('click', function () {
            bgImage.src = 'background1.png';
        });
    }

    let isPlaying = false;
    let isDragging = false;
    let backgroundLoaded = false;
    let currentSongIndex = 0;
    let playlist = [];

    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

    function parseSongInfo(filename) {
        let name = filename.replace(/\.[^/.]+$/, "");
        let artist = 'Unknown Artist';
        let title = name;

        if (name.includes(' - ')) {
            const parts = name.split(' - ');
            if (parts.length >= 2) {
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();
            }
        } else if (name.includes('-') && !name.startsWith('-')) {
            const parts = name.split('-');
            if (parts.length >= 2) {
                artist = parts[0].trim();
                title = parts.slice(1).join('-').trim();
            }
        }

        title = title.replace(/^[\d\s\-\.]+/, '');
        title = title.replace(/\([^)]*\)/g, '');
        title = title.replace(/\[[^\]]*\]/g, '');
        title = title.replace(/\s+/g, ' ').trim();

        artist = artist.replace(/\([^)]*\)/g, '');
        artist = artist.replace(/\[[^\]]*\]/g, '');
        artist = artist.replace(/\s+/g, ' ').trim();

        if (!title) title = name;

        return { title, artist };
    }
    function testAudioFile(filename) {
        return new Promise((resolve) => {
            const audio = new Audio();
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    audio.removeEventListener('canplaythrough', onSuccess);
                    audio.removeEventListener('error', onError);
                    audio.removeEventListener('loadedmetadata', onSuccess);
                }
            };

            const onSuccess = () => {
                cleanup();
                resolve(true);
            };

            const onError = () => {
                cleanup();
                resolve(false);
            };

            audio.addEventListener('canplaythrough', onSuccess, { once: true });
            audio.addEventListener('loadedmetadata', onSuccess, { once: true });
            audio.addEventListener('error', onError, { once: true });

            setTimeout(() => {
                cleanup();
                resolve(false);
            }, 3000);

            audio.src = filename;
            audio.load();
        });
    }

    async function buildPlaylist() {
        const audioFiles = [];
        
        // Comprehensive list of potential MP3 files to test
        const potentialFiles = [
            // Your known files
            'Noisestorm - Crab Rave.mp3',
            'PartyTune - Brainrot rap.mp3'
        ];


        // Test files in smaller batches to avoid overwhelming the browser
        const batchSize = 10;
        let foundCount = 0;
        
        for (let i = 0; i < potentialFiles.length; i += batchSize) {
            const batch = potentialFiles.slice(i, i + batchSize);
            
            // Test each file in the batch
            const results = await Promise.all(
                batch.map(async filename => {
                    try {
                        const exists = await testAudioFile(filename);
                        return exists ? filename : null;
                    } catch (error) {
                        return null;
                    }
                })
            );
            
            // Add found files to the list
            results.forEach(filename => {
                if (filename) {
                    audioFiles.push(filename);
                    foundCount++;
                }
            });
            
            // Show progress
            if (i % 50 === 0) {
            }
        }

        // Build playlist from found files
        playlist = [];
        for (const filename of audioFiles) {
            const songInfo = parseSongInfo(filename);
            playlist.push({
                src: filename,
                title: songInfo.title,
                artist: songInfo.artist,
                originalName: filename
            });
        }

        audioFiles.forEach(file => console.log(`  - ${file}`));
        console.log('Built playlist:', playlist);
        
        return playlist;
    }

    function extractMetadata(audioElement, callback) {
        const tempAudio = new Audio();
        tempAudio.crossOrigin = 'anonymous';

        tempAudio.addEventListener('loadedmetadata', function () {
            const metadata = {
                title: null,
                artist: null,
                duration: tempAudio.duration
            };

            callback(metadata);
        });

        tempAudio.addEventListener('error', function () {
            callback(null);
        });

        tempAudio.src = audioElement.src;
    }

    function setupBackground() {
        // Initialize with background1.png and ensure proper state
        currentBg = 'background1.png';

        // Force load the background image
        bgImage.onload = function () {
            bgImage.classList.add('active');
        };

        bgImage.onerror = function () {
            console.error('Failed to load background:', currentBg);
        };

        bgImage.src = currentBg;
        bgVideo.classList.remove('active');

        // Ensure the first theme button is properly marked as active
        const bgOptions = document.querySelectorAll('.bg-option');
        bgOptions.forEach(opt => opt.classList.remove('active'));
        if (bgOptions.length > 0) {
            bgOptions[0].classList.add('active');
        }

    }

    function loadSong(index) {
        if (index >= 0 && index < playlist.length) {
            currentSongIndex = index;
            const song = playlist[currentSongIndex];

            musicPlayer.src = song.src;
            
            // Make sure songTitle element exists before setting text
            if (songTitle) {
                songTitle.textContent = song.title;
            } else {
                console.error('songTitle element not found!');
            }

            lineProgress.style.width = '0%';
            lineHandle.style.left = '0%';
            currentDisplay.textContent = '00:00';
            totalDisplay.textContent = '--:--';

            musicPlayer.load();
        }
    }

    function nextSong() {
        const nextIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(nextIndex);
        if (isPlaying) {
            musicPlayer.play().catch(err => console.error('Play failed:', err));
        }
    }

    function prevSong() {
        const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
        loadSong(prevIndex);
        if (isPlaying) {
            musicPlayer.play().catch(err => console.error('Play failed:', err));
        }
    }

    function rewind() {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            musicPlayer.current = Math.max(0, musicPlayer.current - 10);
        }
    }

    function forward() {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            musicPlayer.current = Math.min(musicPlayer.duration, musicPlayer.current + 10);
        }
    }

    async function initializePlayer() {
        
        // Check if songTitle element exists
        if (!songTitle) {
            console.error('songTitle element not found during initialization!');
            return;
        }
        
        // Immediately update the title to show we're working
        songTitle.textContent = 'Building playlist...';
        
        await buildPlaylist();
        if (playlist.length > 0) {
            
            // Update title immediately with first song - force it multiple s to ensure it sticks
            songTitle.textContent = playlist[0].title;
            
            // Force update again after a short delay
            setTimeout(() => {
                songTitle.textContent = playlist[0].title;
            }, 100);
            
            // Then load the song
            loadSong(0);
        } else {
            songTitle.textContent = 'No songs found - Add audio files to your directory';
        }
    }

    // ========================================
    // SCROLLING TITLE ANIMATION
    // ========================================
    // Creates a left-scrolling animation in the browser tab title
    // CUSTOMIZABLE OPTIONS:
    // - titleText: Change the characters/text that scroll
    // - position increment: Change +2 to +1 for slower, +3 for faster movement
    // - setInterval timing: Change 150ms for speed (lower = faster)
    function scrollTitle() {
        let titleText = '>>> msihek <<<                                 ';
        let position = 0;

        function updateTitle() {
            const scrolledText = titleText.substring(position) + titleText.substring(0, position);
            document.title = scrolledText;
            position = (position + 2) % titleText.length;
        }

        setInterval(updateTitle, 150);
    }

    function typeStartText() {
        const startText = document.getElementById('startText');
        const text = 'Click anywhere to enter';
        let i = 0;

        startText.textContent = '';

        function typeChar() {
            if (i < text.length) {
                startText.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, 100);
            }
        }

        setTimeout(typeChar, 500);
    }
    
    // ========================================
    // GMT  FUNCTION
    // ========================================
    function updateGmtTime() {
        const gmtTimeElement = document.getElementById('gmtTime');
        if (gmtTimeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ru-RU', {
                timeZone: 'UTC + 5',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone:'Asia/Yekaterinburg'})
            gmtTimeElement.textContent = `${timeString}`;
        }
    }

    initializePlayer();
    typeDescription();
    initBackgroundCycling();
    scrollTitle();
    typeStartText();
    updateGmtTime(); // Initial call to show time immediately
    setInterval(updateGmtTime, 1000); // Update time every second


    startScreen.addEventListener('click', function () {

        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            setupBackground();
        }, 500);

        function playMusic() {
            if (playlist.length > 0) {
                musicPlayer.play().then(() => {
                    isPlaying = true;
                    updatePlayPauseButton();
                }).catch(err => {
                    console.error('Music autoplay failed:', err);
                    isPlaying = false;
                    updatePlayPauseButton();
                });
            } else {
                console.log('No songs in playlist to play');
                isPlaying = false;
                updatePlayPauseButton();
            }
        }

        if (playlist.length > 0 && musicPlayer.readyState >= 2) {
            playMusic();
        } else {
            setTimeout(() => {
                if (playlist.length > 0) {
                    if (musicPlayer.readyState >= 2) {
                        playMusic();
                    } else {
                        musicPlayer.addEventListener('canplay', playMusic, { once: true });
                    }
                }
            }, 100);
        }
    });

    function updatePlayPauseButton() {
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const playIcon = playPauseBtn.querySelector('.play-icon');

        if (isPlaying) {
            if (playIcon) {
                playIcon.remove();
            }
            if (!pauseIcon) {
                const newPauseIcon = document.createElement('div');
                newPauseIcon.className = 'pause-icon';
                newPauseIcon.innerHTML = '<div class="pause-bar"></div><div class="pause-bar"></div>';
                playPauseBtn.appendChild(newPauseIcon);
            }
        } else {
            if (pauseIcon) {
                pauseIcon.remove();
            }
            if (!playIcon) {
                const newPlayIcon = document.createElement('div');
                newPlayIcon.className = 'play-icon';
                playPauseBtn.appendChild(newPlayIcon);
            }
        }
    }

    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            musicPlayer.pause();
            isPlaying = false;
        } else {
            musicPlayer.play().then(() => {
                isPlaying = true;
            }).catch(err => {
                console.error('Play failed:', err);
                isPlaying = false;
            });
        }
        updatePlayPauseButton();
    });

    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    rewindBtn.addEventListener('click', rewind);
    forwardBtn.addEventListener('click', forward);

    function updateTimeline() {
        if (!isDragging && musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            const progress = (musicPlayer.currentTime / musicPlayer.duration) * 100;
            timelineProgress.style.width = Math.max(0, Math.min(100, progress)) + '%';
            timelineHandle.style.left = Math.max(0, Math.min(100, progress)) + '%';
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    timeline.addEventListener('click', function (e) {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            const rect = timeline.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const newTime = percentage * musicPlayer.duration;

            musicPlayer.currentTime = newTime;
            updateTimeline();
        }
    });

    let startX, startLeft;

    timelineHandle.addEventListener('mousedown', function (e) {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            isDragging = true;
            startX = e.clientX;
            const rect = timeline.getBoundingClientRect();
            startLeft = ((musicPlayer.currentTime / musicPlayer.duration) * rect.width);

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
            e.preventDefault();
        }
    });

    function handleDrag(e) {
        if (!isDragging) return;

        const rect = timeline.getBoundingClientRect();
        const deltaX = e.clientX - startX;
        let newLeft = startLeft + deltaX;

        newLeft = Math.max(0, Math.min(newLeft, rect.width));
        const percentage = newLeft / rect.width;

        timelineProgress.style.width = (percentage * 100) + '%';
        timelineHandle.style.left = (percentage * 100) + '%';

        if (musicPlayer.duration && !isNaN(musicPlayer.duration) && musicPlayer.duration > 0) {
            musicPlayer.currentTime = Math.max(0, Math.min(musicPlayer.duration, percentage * musicPlayer.duration));
        }
    }

    function handleDragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }

    musicPlayer.addEventListener('loadedmetadata', function () {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('durationchange', function () {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('timeupdate', function () {
        if (musicPlayer.currentTime && !isNaN(musicPlayer.currentTime)) {
            currentTimeDisplay.textContent = formatTime(musicPlayer.currentTime);
        }
        updateTimeline();
    });

    musicPlayer.addEventListener('ended', function () {
        if (playlist.length > 1) {
            nextSong();
        } else {
            isPlaying = false;
            updatePlayPauseButton();
            musicPlayer.currentTime = 0;
            updateTimeline();
        }
    });

    musicPlayer.addEventListener('canplay', function () {
        if (musicPlayer.duration && !isNaN(musicPlayer.duration)) {
            totalTimeDisplay.textContent = formatTime(musicPlayer.duration);
        }
    });

    musicPlayer.addEventListener('error', function (e) {
        console.error('Music loading error:', e);
    });

    musicPlayer.addEventListener('play', function () {
        isPlaying = true;
        updatePlayPauseButton();
    });

    musicPlayer.addEventListener('pause', function () {
        isPlaying = false;
        updatePlayPauseButton();
    });

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((resolve, reject) => {
                if (document.execCommand('copy')) {
                    resolve();
                } else {
                    reject();
                }
                document.body.removeChild(textArea);
            });
        }
    }

    function showNotification(message) {
        notificationText.textContent = message;
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }

    if (litecoinBtn) {
        litecoinBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const address = this.getAttribute('data-address');

            if (address && address !== 'ltc1q2q2eeaspjw42nhnh4k7tvlxd0zry4v5rkl2v37') {
                copyToClipboard(address).then(() => {
                    console.log('Litecoin address copied to clipboard');
                    showNotification('Litecoin address copied!');
                }).catch(err => {
                    console.error('Failed to copy address:', err);
                    alert('Failed to copy address. Please copy manually: ' + address);
                });
            } else {
                alert('Please set your Litecoin address in the HTML file');
            }
        });
    }

    if (discordBtn) {
        discordBtn.addEventListener('click', function (e) {
            window.open(`https://discord.com/users/${DISCORD_USER_ID}`, `_blank`);
        });
    }

    updatePlayPauseButton();

    musicPlayer.load();

    const DISCORD_USER_ID = '772201399568171058';
    const statusIndicator = document.getElementById('statusIndicator');
    const activityContent = document.getElementById('activityContent');

    async function fetchDiscordActivity() {
        try {
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            const data = await response.json();

            if (data.success) {
                updateDiscordStatus(data.data);
            } else {
                showSetupInstructions();
            }
        } catch (error) {
            console.error('Discord API error:', error);
            showError('Connection failed');
        }
    }

    function updateDiscordStatus(userData) {
        const discordAvatar = document.getElementById('discordAvatar');
        const discordIcon = document.querySelector('.discord-icon');

        if (userData.discord_user && userData.discord_user.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=64`;
            discordAvatar.src = avatarUrl;
            discordAvatar.style.display = 'block';
            discordIcon.style.display = 'none';
        } else {
            discordAvatar.style.display = 'none';
            discordIcon.style.display = 'block';
        }

        const status = userData.discord_status;
        statusIndicator.className = `status-indicator ${status}`;

        const activities = userData.activities;

        if (activities && activities.length > 0) {
            let activityHTML = '';

            activities.forEach(activity => {
                if (activity.type === 0) {
                    activityHTML += createActivityItem('', activity.name, `Playing ${activity.name}`);
                } else if (activity.type === 2) {
                    const artist = activity.state || 'Unknown Artist';
                    const song = activity.details || 'Unknown Song';
                    activityHTML += createActivityItem('七', 'Spotify', `${song} by ${artist}`);
                } else if (activity.type === 3) {
                    activityHTML += createActivityItem('銅', activity.name, `Watching ${activity.details || activity.name}`);
                } else if (activity.type === 4) {
                    activityHTML += createActivityItem('眺', 'Custom Status', activity.state || 'Custom status');
                }
            });

            activityContent.innerHTML = activityHTML || '<div class="no-activity">No activity</div>';
        } else {
            activityContent.innerHTML = '<div class="no-activity">No activity</div>';
        }
    }

    function createActivityItem(icon, name, details) {
        return `
            <div class="activity-item">
                <span style="font-size: 16px;">${icon}</span>
                <div class="activity-text">
                    <div class="activity-name">${name}</div>
                    <div class="activity-details">${details}</div>
                </div>
            </div>
        `;
    }

    function showError(message) {
        activityContent.innerHTML = `<div class="error-message">${message}</div>`;
        statusIndicator.className = 'status-indicator';
    }

    function showSetupInstructions() {
        activityContent.innerHTML = `
            <div class="setup-instructions">
                <div class="setup-title">Discord Setup</div>
                <div class="setup-text">To show real-time activity:</div>
                <div class="setup-steps">
                    1. Get Discord User ID<br>
                    2. Join discord.gg/lanyard<br>
                    3. Update DISCORD_USER_ID<br>
                    4. Keep Discord open
                </div>
            </div>
        `;
        statusIndicator.className = 'status-indicator';
    }

    setTimeout(() => {
        fetchDiscordActivity();
        setInterval(fetchDiscordActivity, 30000);
    }, 2000);



    // ===========================
    // GLOBAL VIEW COUNTER (Vercel + Upstash Redis)
    // - Counts each visitor once per browser (no refresh increments)
    // - Persists across browser restarts (via localStorage UUID)
    // - Global across all visitors (stored in Redis)
    // ===========================
    (async function() {
        try {
            const counterEl = document.getElementById('visitCounter');
            if (!counterEl) return;

            // Persistent anonymous visitor id
            let vid = localStorage.getItem('vc_visitor_id');
            if (!vid) {
                if (window.crypto && crypto.randomUUID) {
                    vid = crypto.randomUUID();
                } else {
                    vid = Date.now().toString(36) + Math.random().toString(36).slice(2);
                }
                localStorage.setItem('vc_visitor_id', vid);
            }

            const res = await fetch('/api/viewcounter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: vid })
            });

            if (!res.ok) throw new Error('Counter API failed ' + res.status);
            const data = await res.json();
            counterEl.textContent = (data && typeof data.count !== 'undefined') ? data.count : 'ERR';
        } catch (e) {
            console.error('View counter error:', e);
            const counterEl = document.getElementById('visitCounter');
            if (counterEl) counterEl.textContent = 'ERR';
        }
    })();

});
