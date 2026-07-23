import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import ToDo from "./todo";
import "tosijs-ui";
import { reactWebComponents } from "react-tosijs";

const container = document.querySelector("main");

// tosijs-ui ≥ 1.6 registers tosi-* tags (the xin-* names are gone)
const BodyMovin = reactWebComponents.tosiLottie;
const Markdown = reactWebComponents.tosiMd;

// tosi-md's src path races its initial render against the fetch and never
// re-renders when the fetch wins — load the markdown ourselves and render
// explicitly (see tosijs-ui issue: tosi-md src race)
const Doc = ({ src }: { src: string }) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((response) => response.text())
      .then((text) => {
        if (cancelled || !ref.current) return;
        ref.current.value = text;
        ref.current.render();
      });
    return () => {
      cancelled = true;
    };
  }, [src]);
  return <Markdown class="doc" ref={ref} />;
};

const root = ReactDOM.createRoot(container);

root.render(
  <>
    <div className="column">
      <div className="parallax sky"></div>
      <div className="parallax far"></div>
      <div className="parallax medium"></div>
      <div className="parallax near"></div>
      <BodyMovin
        style={{
          width: "300px",
          height: "300px",
          marginBottom: "-65px",
          zIndex: "1",
        }}
        src="/tosi.json"
      />
      <ToDo />
      <Doc src="/use-tosi.md" />
    </div>
  </>,
);
