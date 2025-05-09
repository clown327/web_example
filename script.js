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
            navbar.style.background = `linear-gradient(to right, #e50914, #8B0000)`;
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
document.querySelectorAll('.poster-item').forEach(item => {
    item.addEventListener('click', () => {
        alert('영화 상세 페이지로 이동할 예정입니다.');
    });
});

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
