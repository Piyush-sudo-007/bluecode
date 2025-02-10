import "./Logo.css";

const Logo = () => {
  return (
    <div className="logo-container">
      <div className="outer-box">
        <div className="upper"></div>
        <div className="lower"></div>
      </div>
      <h3 style={{ color: "red", textDecoration: "underline" }}>
        Please use pre-defined user inputs !! This issue will be shorted in
        upcoming version.
      </h3>
    </div>
  );
};

export default Logo;
