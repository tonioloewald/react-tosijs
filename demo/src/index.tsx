import React from "react";
import ReactDOM from "react-dom/client";
import ToDo from "./todo";
import "tosijs-ui";
import { reactWebComponents } from "react-tosijs";

const container = document.querySelector("main");

// tosijs-ui ≥ 1.6 registers tosi-* tags (the xin-* names are gone)
const BodyMovin = reactWebComponents.tosiLottie;
const Markdown = reactWebComponents.tosiMd;

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
      <Markdown class="doc" src="/use-tosi.md" />
    </div>
  </>,
);
