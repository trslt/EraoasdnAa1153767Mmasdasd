import React, { useLayoutEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Page,
  BlockTitle,
  List, 
  ListItem,
  Radio,
  Toggle,
  Link,
  Popover,
} from 'konsta/react';
import { logout } from 'wasp/client/auth'

export default function MySettingsPage() {

  const [darkMode, setDarkMode] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  });

  const routes = [
    { title: "Marketing", path: "/app/settings/marketing" },
    { title: "Profilo", path: "/app/me/settings" },
    { title: "Subscription", path: "/app/settings/subscription" },
    { title: "Support", path: "/app/settings/support" },
    { title: "Terms & Conditions", path: "/app/terms-and-conditions" },
  ];
  return (
    <>
      <BlockTitle>Applicazione</BlockTitle>
      <List strong inset>
        {routes.map((route) => (
          <ListItem
            key={route.path}
            link
            title={route.title}
          />
        ))}
      </List>

      <BlockTitle withBlock={false}>Tema</BlockTitle>
      <List strong inset>
        <ListItem
          title="Dark Mode"
          label
          after={
            <Toggle
              component="div"
              onChange={() => toggleDarkMode()}
              checked={darkMode}
            />
          }
        />
      </List>

      <BlockTitle>Utente</BlockTitle>
      <List strong inset>
        <ListItem
          title="Disconnetti"
          label
          onClick={logout}
        />
      </List>
    </>
  );
}



