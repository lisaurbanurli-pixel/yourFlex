export function LandingFooter() {
  return (
    <footer className="ml-0 bg-[#1A3A4A] text-white py-4">
      <div className="footer-inner flex justify-between items-center px-4">
        <div className="pull-left">
          &copy;{" "}
          <span className="current-year">{new Date().getFullYear()}</span>{" "}
          <span className="text-bold">
            Copyright © 2002-
            <span className="current-year">{new Date().getFullYear()}</span>{" "}
            TRI-AD | Disclaimer -{" "}
            <a
              href="/mercer-privacy"
              target="_blank"
              className="text-white hover:underline"
            >
              Terms of Use and Privacy Policy
            </a>
          </span>
          <span>All rights reserved</span>
        </div>
        <div className="pull-right">
          <span className="go-top cursor-pointer">
            <i className="ti-angle-up"></i>
          </span>
        </div>
      </div>
    </footer>
  );
}
