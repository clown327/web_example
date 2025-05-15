// ===== 원래의 스크롤 효과 및 기본 기능 =====
// 스크롤시 네비게이션 바 그라데이션 효과
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 50) {
        // 스크롤 위치에 따라 점진적으로 투명도 조절
        const opacity = Math.min(1, scrollPosition / 300);
        
        navbar.classList.add('scrolled');
        
        // 스크롤 위치에 따라 그라데이션 색상 강도 변경
        if (scrollPosition > 300) {
            navbar.style.background = `linear-gradient(to right,rgb(239, 23, 34),rgb(110, 0, 0))`;
        } else {
            // 중간 지점에서는 부드러운 그라데이션 전환
            const midPoint = scrollPosition / 300;
            navbar.style.background = `linear-gradient(to right, rgba(229, 9, 20, ${opacity}), rgba(139, 0, 0, ${opacity}))`;
        }
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 10%, transparent)';
    }
});

// 추가: 스크롤 위치에 따라 페이지 전체 배경색도 미묘하게 변경
window.addEventListener('scroll', function() {
    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // 스크롤 위치에 따라 배경색 미묘하게 변경 (어두운 색상으로 유지)
    if (scrollPercentage > 5) {
        // 스크롤 위치에 따라 배경색 조금씩 변경
        const darkLevel = Math.max(14, Math.min(20, 14 + (scrollPercentage / 20)));
        document.body.style.backgroundColor = `rgb(${darkLevel}, ${darkLevel}, ${darkLevel})`;
    } else {
        document.body.style.backgroundColor = '#141414';
    }
});

// 포스터 아이템 클릭 이벤트 (예시)
//document.querySelectorAll('.poster-item').forEach(item => {
//    item.addEventListener('click', () => {
//        alert('영화 상세 페이지로 이동할 예정입니다.');
//    });
//});

// 스크롤 시 콘텐츠 행이 뷰포트에 들어오면 효과 적용
const observeRows = () => {
    const rows = document.querySelectorAll('.row-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view');
            }
        });
    }, {
        threshold: 0.2
    });
    
    rows.forEach(row => {
        observer.observe(row);
    });
};

// ===== 로그인 관련 기능 =====
// 모달 관련 기능
const modal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const closeBtn = document.querySelector('.close');

// 로그인 버튼 클릭 시 모달 열기
loginBtn?.addEventListener('click', () => {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
});

// 닫기 버튼 클릭 시 모달 닫기
closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 허용
});

// 모달 외부 클릭 시 모달 닫기
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Google 로그인 처리 함수
function handleCredentialResponse(response) {
    // 구글 ID 토큰 디코딩
    const responsePayload = decodeJwtResponse(response.credential);
    
    // 사용자 정보 추출
    const userId = responsePayload.sub;
    const fullName = responsePayload.name;
    const givenName = responsePayload.given_name;
    const familyName = responsePayload.family_name;
    const imageUrl = responsePayload.picture;
    const email = responsePayload.email;
    
    // 로그인 상태 업데이트
    updateUserInterface(true, {
        name: fullName,
        email: email,
        avatar: imageUrl
    });
    
    // 로컬 스토리지에 사용자 정보 저장 (세션 유지)
    localStorage.setItem('user', JSON.stringify({
        name: fullName,
        email: email,
        avatar: imageUrl,
        loggedIn: true
    }));
    
    // 모달 닫기
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// JWT 토큰 디코딩 함수
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// UI 업데이트 함수
function updateUserInterface(isLoggedIn, userData = null) {
    const loggedInUI = document.getElementById('logged-in');
    const notLoggedInUI = document.getElementById('not-logged-in');
    
    if (isLoggedIn && userData) {
        // 로그인 상태 UI 표시
        loggedInUI.style.display = 'block';
        notLoggedInUI.style.display = 'none';
        
        // 사용자 정보 표시
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-email').textContent = userData.email;
        document.getElementById('user-avatar').src = userData.avatar;
    } else {
        // 로그아웃 상태 UI 표시
        loggedInUI.style.display = 'none';
        notLoggedInUI.style.display = 'block';
    }
}

// 로그아웃 기능
document.getElementById('logout-btn')?.addEventListener('click', () => {
    // 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem('user');
    
    // UI 업데이트
    updateUserInterface(false);
    
    // Google 로그아웃 (선택 사항)
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }
});

// 일반 로그인 폼 제출 처리 (이 예제에서는 실제 인증은 구현하지 않음)
document.querySelector('.login-form-btn')?.addEventListener('click', function(e) {
    e.preventDefault();
    alert('이 데모에서는 구글 로그인만 구현되어 있습니다.');
});

// ===== 페이지 로드 초기화 =====
// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 상태 확인
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.loggedIn) {
            updateUserInterface(true, userData);
        }
    }
    
    // 콘텐츠 행 관찰자 초기화
    observeRows();
});

// 영화 데이터 (실제 서비스에서는 API에서 가져올 정보)
const movieData = {
    1: {
        title: '아바타: 물의 길',
        year: '2022',
        rating: '12세 이상',
        runtime: '3시간 12분',
        score: 7.6,
        description: '판도라 행성에서 제이크 설리와 네이티리가 이룬 가족이 겪게 되는 위기와 살아남기 위해 싸워야 하는 이야기를 그린 작품으로, 전편인 아바타에 이어지는 이야기를 담고 있다.',
        backdrop: 'https://image.tmdb.org/t/p/original/198vrF8k7mfQ4FjDJsBmdQcaiyq.jpg',
        poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/u2aVXft5GLBQnjzWVNda7sdDpdu.jpg',
        cast: [
            { name: '샘 워싱턴', character: '제이크 설리', photo: 'https://image.tmdb.org/t/p/w200/qB2vwKGZy8T9gWbdCsAL8uPjE4Z.jpg' },
            { name: '조 샐다나', character: '네이티리', photo: 'https://image.tmdb.org/t/p/w200/iOVbUH20il632nj2v01NCtYYOZ4.jpg' },
            { name: '시고니 위버', character: '크레이스 박사', photo: 'https://image.tmdb.org/t/p/w200/fB35yR7B0nBMih8jv9vRIPzV8ob.jpg' }
        ]
    },
    2: {
        title: '존 윅 4',
        year: '2023',
        rating: '18세 이상',
        runtime: '2시간 49분',
        score: 7.8,
        description: '죽을 위기에서 살아난 존 윅은 하이 테이블을 향해 복수의 칼날을 휘두르기 시작하는데, 뉴욕, 파리, 오사카, 베를린을 배경으로 펼쳐지는 처절한 암살자들의 혈투를 그려냈다.',
        backdrop: 'https://image.tmdb.org/t/p/original/h8gHn0OzBoaefsYseUByqsmEDMY.jpg',
        poster: 'https://image.tmdb.org/t/p/w500/cvsXj3I9Q2yyC4YGEotpkkAcMIO.jpg',
        cast: [
            { name: '키아누 리브스', character: '존 윅', photo: 'https://image.tmdb.org/t/p/w200/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg' },
            { name: '로렌스 피시번', character: '바우어리 킹', photo: 'https://image.tmdb.org/t/p/w200/8suOhUmPbfKqDQ17jQ1Gy0mI3P4.jpg' },
            { name: '이안 맥쉐인', character: '윈스턴', photo: 'https://image.tmdb.org/t/p/w200/bFY0uVRTrk3ho3PvwvZh1ksUoEU.jpg' }
        ]
    },
    3: {
        title: '스파이더맨: 어크로스 더 유니버스',
        year: '2023',
        rating: '12세 이상',
        runtime: '2시간 20분',
        score: 8.4,
        description: '여러 평행세계의 스파이더맨들이 모여 새로운 빌런에 맞서는 이야기. 마일스 모랄레스가 다양한 차원의 스파이더 히어로들과 함께 더 큰 위협에 맞서게 된다.',
        backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        poster: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
        cast: [
            { name: '샤메익 무어', character: '마일스 모랄레스(목소리)', photo: 'https://image.tmdb.org/t/p/w200/uJNaSTfWXuKf3XXtT8RXCOpYPqj.jpg' },
            { name: '헤일리 스타인펠드', character: '그웬 스테이시(목소리)', photo: 'https://image.tmdb.org/t/p/w200/q4UpZBi6QE6GrA44YvLxv7kUSrt.jpg' },
            { name: '오스카 아이작', character: '미구엘 오하라(목소리)', photo: 'https://image.tmdb.org/t/p/w200/dW5U5yrIIPmMjRThR9KT2xH6nTz.jpg' }
        ]
    }
};

// 영화 포스터 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    // 모달 요소 가져오기
    const movieModal = document.getElementById('movie-detail-modal');
    const modalClose = document.querySelector('.movie-modal-close');
    
    // 포스터 아이템 클릭 이벤트 등록
    document.querySelectorAll('.poster-item').forEach(item => {
        item.addEventListener('click', () => {
            const movieId = item.getAttribute('data-movie-id');
            openMovieDetail(movieId);
        });
    });
    
    // 모달 닫기 버튼 이벤트
    modalClose.addEventListener('click', () => {
        movieModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            movieModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // 기존 관찰자 함수 호출 (이전에 작성한 코드가 있다면)
    if (typeof observeRows === 'function') {
        observeRows();
    }
});

// 영화 상세정보 표시 함수
function openMovieDetail(movieId) {
    const movie = movieData[movieId];
    
    // 영화 정보가 없는 경우 기본 알림 표시
    if (!movie) {
        alert('영화 정보를 불러올 수 없습니다.');
        return;
    }
    
    // 모달 요소 가져오기
    const movieModal = document.getElementById('movie-detail-modal');
    const modalHeader = document.querySelector('.movie-detail-header');
    const modalTitle = document.getElementById('modal-movie-title');
    const modalYear = document.getElementById('modal-movie-year');
    const modalRating = document.getElementById('modal-movie-rating');
    const modalRuntime = document.getElementById('modal-movie-runtime');
    const modalScore = document.getElementById('modal-movie-score');
    const modalDescription = document.getElementById('modal-movie-description');
    const modalPoster = document.getElementById('modal-movie-poster');
    const modalCast = document.getElementById('modal-movie-cast');
    
    // 영화 정보 설정
    modalTitle.textContent = movie.title;
    modalYear.textContent = movie.year;
    modalRating.textContent = movie.rating;
    modalRuntime.textContent = movie.runtime;
    modalScore.textContent = movie.score;
    modalDescription.textContent = movie.description;
    modalPoster.src = movie.poster;
    modalHeader.style.backgroundImage = `url('${movie.backdrop}')`;
    
    // 출연진 정보 설정
    modalCast.innerHTML = '';
    if (movie.cast && movie.cast.length > 0) {
        movie.cast.forEach(actor => {
            const castItem = document.createElement('div');
            castItem.className = 'cast-item';
            castItem.innerHTML = `
                <img class="cast-photo" src="${actor.photo}" alt="${actor.name}">
                <div class="cast-name">${actor.name}</div>
                <div class="cast-character">${actor.character}</div>
            `;
            modalCast.appendChild(castItem);
        });
    } else {
        modalCast.innerHTML = '<p>출연진 정보가 없습니다.</p>';
    }
    
    // 모달 표시
    movieModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}
document.addEventListener('DOMContentLoaded', function() {
  // 배너 스와이퍼 초기화
  const bannerSwiper = new Swiper('.banner-swiper', {
    // 기본 설정
    direction: 'horizontal',
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    
    // 네비게이션 화살표
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    
    // 페이지네이션 (하단 점)
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    }
  });
});
