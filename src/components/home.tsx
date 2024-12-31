import "@/assets/styles/home.css";
import { IncidentReports } from "@/components/IncidentReports";
import { OpenMobileApp } from "@/components/OpenMobileApp";
import SignInPrompt from "@/components/SignInPrompt";
import { StylesHoverCard } from "@/components/StylesPopup";
import { useStateContext } from "@/StateContext";

function Home() {
  const state = useStateContext();

  const { lng, lat, zoom, isDisplaySignInPrompt } = state;

  window.addEventListener(
    "beforeunload",
    function () {
      window.localStorage.setItem(
        "lastSessionLocation",
        `@map=${zoom}/${lat}/${lng}`,
      );
    },
    false,
  );

  return (
    <>
      <IncidentReports />
      <StylesHoverCard />
      {isDisplaySignInPrompt && <SignInPrompt />}
      <OpenMobileApp />
    </>
  );
}

export default Home;
