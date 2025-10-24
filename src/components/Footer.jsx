import "./Footer.css";

export default function Footer(){
    return (
      <footer className="foot">
        <div className="container">
          <div className="foot__grid">
            <div>
              <h4>ศูนย์ช่วยเหลือ</h4>
              <ul>
                <li><a href="#">ดูแลสมาชิก</a></li>
                <li><a href="#">Help Centre</a></li>
                <li><a href="#">ข้อกำหนดการใช้บริการ</a></li>
              </ul>
            </div>
  
            <div>
              <h4>#Only Crystal Shine</h4>
              <ul>
                <li><a href="#">จองคิว</a></li>
                <li><a href="#">บริการทั้งหมด</a></li>
                <li><a href="#">โปรโมชั่น</a></li>
              </ul>
            </div>
  
            <div>
              <h4>ติดตามเรา</h4>
              <ul>
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Line</li>
              </ul>
            </div>
          </div>
  
          <p className="foot__copy">© {new Date().getFullYear()} Crystal Shine — All rights reserved.</p>
        </div>
      </footer>
    );
  }