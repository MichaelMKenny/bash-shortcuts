import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  SidebarNavigation,
  staticClasses,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./shortcuts-manager/About";
import { AddShortcut } from "./shortcuts-manager/AddShortcut";
import { ShortcutLauncher } from "./components/ShortcutLanucher";
import { ManageShortcuts } from "./shortcuts-manager/ManageShortcuts";

import { PyInterop } from "./PyInterop";
import { Shortcut } from "./Shortcut";
import { ShortcutsContextProvider, ShortcutsState, useShortcutsState } from "./state/ShortcutsState";

type ShortcutsDictionary = {
  [key:string]: Shortcut
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const {shortcuts, setShortcuts} = useShortcutsState();

  async function reload() {
    await PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
    });
  }
  
  if (Object.values(shortcuts as ShortcutsDictionary).length == 0) {
    reload();
  }

  return (
    <PanelSection> {/* title="Shortcuts" */}
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/shortcuts-nav"); }} >
          Manage Shortcuts
        </ButtonItem>
      </PanelSectionRow>

      {Object.values(shortcuts)
          .sort((a, b) => a.position - b.position)
          .map((itm: Shortcut) => (
          <ShortcutLauncher shortcut={itm} />
      ))}

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={reload} >
          Reload
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ShortcutsManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title="Shortcuts Manager"
      showTitle
      pages={[
        {
          title: "Add a Shortcut",
          content: <AddShortcut />,
          route: "/shortcuts-nav/add",
        },
        {
          title: "Manage Shortcuts",
          content: <ManageShortcuts />,
          route: "/shortcuts-nav/manage",
        },
        {
          title: "About Shortcuts",
          content: <About />,
          route: "/shortcuts-nav/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);

  const state = new ShortcutsState();

  serverApi.routerHook.addRoute("/shortcuts-nav", () => (
    <ShortcutsContextProvider shortcutsStateClass={state}>
      <ShortcutsManagerRouter />
    </ShortcutsContextProvider>
  ));
  // serverApi.routerHook.addRoute("/shortcuts-nav/add", AddShortcut);
  // serverApi.routerHook.addRoute("/shortcuts-nav/manage", ManageShortcuts);
  // serverApi.routerHook.addRoute("/shortcuts-nav/about", About);

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: (
      <ShortcutsContextProvider shortcutsStateClass={state}>
        <Content serverAPI={serverApi} />
      </ShortcutsContextProvider>
    ),
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/shortcuts-nav");
      // serverApi.routerHook.removeRoute("/shortcuts-nav/add");
      // serverApi.routerHook.removeRoute("/shortcuts-nav/manage");
      // serverApi.routerHook.removeRoute("/shortcuts-nav/about");
    },
  };
});
