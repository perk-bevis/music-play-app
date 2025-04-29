// 1. render song
// 2 scroll top
// 3 play /pause/seek
// 4 cd rotate
// 5 next /prev 
// 6 radom 
// 7 next / repeat when ended 
// 8 active song 
// 9 scroll active song into view 
// 10 play song when click 


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PB-PLAYER';

const player = $('.player');
// trong ham loadCurrentSong
const heading = $('header h2');
const cdthumb = $('.cd-thumb');
const audio = $('audio');
// lấy element cd trong ham handle event
const cd = $('.cd');

const playBtn = $('.btn-toggle-play');
const progress = $('#progress');

const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom:false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Sơn Tùng MTP',
            path: './assests/music/1.mp3',
            image: './assests/img/1.jpg'
        },
        {
            name: 'Khổng tú cầu',
            singer: 'Tony Nguyễn',
            path: './assests/music/2.mp3',
            image: './assests/img/2.jpg'
        },
        {
            name: 'Anh thôi nhân nhượng',
            singer: 'Tony Nguyễn',
            path: './assests/music/3.mp3',
            image: './assests/img/3.jpg'
        },
        {
            name: 'Bồ công anh',
            singer: 'Phong Max',
            path: './assests/music/4.mp3',
            image: './assests/img/4.jpg'
        },
        {
            name: 'Dù cho tận thế',
            singer: 'Erik',
            path: './assests/music/5.mp3',
            image: './assests/img/5.jpg'
        },
        {
            name: 'Nỗi nhớ vô hạn',
            singer: 'Thanh Hưng',
            path: './assests/music/6.mp3',
            image: './assests/img/6.jpg'
        },
        {
            name: 'Từng là ',
            singer: 'Vũ Cát Tường',
            path: './assests/music/7.mp3',
            image: './assests/img/7.jpg'
        },
        {
            name: 'Shape of you',
            singer: 'Ed Sheeran',
            path: './assests/music/8.mp3',
            image: './assests/img/8.jpg'
        },
        {
            name: 'Memories',
            singer: 'Maroon 5',
            path: './assests/music/9.mp3',
            image: './assests/img/9.jpg'
        },
        {
            name: 'Yourman',
            singer: 'The Weeknd',
            path: './assests/music/10.mp3',
            image: './assests/img/10.jpg'
        }
    ],

    setConfig: function (key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    // render song to ui
    render: function () {
        const htmls = this.songs.map((song , index) => {
            return `
            <div class="song  ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        // lệnh render ra ngoài giao diện html
        $('.playlist').innerHTML = htmls.join('');
    },

    defineProperties: function () {
        // Tạo thêm thuộc tính mới tên là currentSong cho app.
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    // hàm xử lý sự kiện
    handleEvents: function () {
        const _this = this;
        const cdwwidth = cd.offsetWidth;
        // xu ly cd quay/dung cd
        // nhan doi so la 1 mang
        const cdThumbAnimate = cdthumb.animate([
            { transform : 'rotate(360deg)'}
        ],{
            duration: 10000, // quay trong 10s
            iterations: Infinity,
        })

        cdThumbAnimate.pause();
        // xu ly phong to thu nho cd 
        document.onscroll = function () {
            // sự kiện kéo
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            const newCdWidth = cdwwidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdwwidth;
        }

        // xu ly khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // khi song duoc play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // xu ly khi tua song
        progress.onchange = function (e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // next song
        nextBtn.onclick = function (){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
        }

        // prev song
        prevBtn.onclick = function (){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // xử lí bật /tắt random song
        randomBtn.onclick = function (){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',  _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // xử lý lặp lại 1 song 
        repeatBtn.onclick = function (e){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // xử lý khi audio ended
        audio.onended = function (){
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
        }

        //lắng nghe click vào playlist
        playlist.onclick = function (e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                // xử lý khi click vào song
                if(songNode){
                    // vì là chuỗi nên chuyển sang number
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong(); 
                    audio.play();
                    _this.render();
                }

                // xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
            }
        }
    },

    scrollToActiveSong: function (){
        setTimeout(() => {
            $('.song.active').scrollIntoView();
        },500)
    },

    // tai thong tin bai hai dau tien vao ui khi chay app
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdthumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    }, 

    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function () {
        // gán cấu hình từ config vào app
        this.loadConfig();

        // dinh nghia cac thuoc tinh cho object
        this.defineProperties();
        // lang nghe xu li cac su kien (dom events)
        this.handleEvents();

        // tai thong tin bai hai dau tien vao ui khi chay app
        this.loadCurrentSong();

        // render playlist
        this.render();

        // hiển thị trạng thái ban đầu của button repeat và ramdom
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();