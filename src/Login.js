import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

const Login = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [insights, setInsights] = useState({});

  const fetchUserProfile = useCallback(() => {
    window.FB.api("/me", { fields: "name,email,picture" }, function (response) {
      console.log("response", response);
      setUser(response);
      fetchUserPages();
    });
  }, []);

  const statusChangeCallback = useCallback(
    (response) => {
      if (response.status === "connected") {
        fetchUserProfile();
      }
    },
    [fetchUserProfile]
  );

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v10.0",
      });

      window.FB.AppEvents.logPageView();

      // Check if user is already logged in
      window.FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
      });
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, [statusChangeCallback]);

  const fetchUserPages = () => {
    window.FB.api("/me/accounts", function (response) {
      console.log("response.data", response.data);
      setPages(response.data);
    });
  };

  const handleLogin = () => {
    window.FB.login((response) => {
      if (response.authResponse) {
        fetchUserProfile();
      }
    });
  };

  const handlePageChange = (e) => {
    const pageId = e.target.value;
    if (pageId) fetchPageInsights(pageId);
  };

  const fetchPageInsights = async (pageId) => {
    const page = pages?.find((x) => x?.id === pageId);
    window.FB.api(
      // `/${pageId}/insights/page_impressions_unique`,
      `/${pageId}/insights?metric=page_impressions_unique,page_fans,page_video_views,post_reactions_like_total&period=total_over_range&access_token=${page?.access_token}`,
      //
      function (response) {
        console.log("response", response);
        const insightsData = response?.data?.reduce((acc, item) => {
          acc[item?.name] = item?.values?.[0]?.value;
          return acc;
        }, {});
        setInsights(insightsData);
      }
    );
  };

  return (
    <Container>
      {!user ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login with Facebook
          </Button>
        </Box>
      ) : (
        <Box mt={5}>
          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user.picture.data.url}
                    alt="Profile"
                    sx={{ width: 56, height: 56 }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h4">Welcome, {user.name}</Typography>
                </Grid>
              </Grid>
              <Box mt={3}>
                <FormControl fullWidth>
                  <InputLabel>
                    Select a Page
                  </InputLabel>
                  <Select onChange={handlePageChange} defaultValue="">
                    <MenuItem value="">
                      <em>Select a Page</em>
                    </MenuItem>
                    {pages.map((page) => (
                      <MenuItem key={page.id} value={page.id}>
                        {page.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {Object.keys(insights).length > 0 && (
                <Box mt={5}>
                  <Typography variant="h5">Page Insights</Typography>
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Followers</Typography>
                          <Typography>{insights.page_fans}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Engagement</Typography>
                          <Typography>{insights.page_engaged_users}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">
                            Total Impressions
                          </Typography>
                          <Typography>{insights.page_impressions}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Reactions</Typography>
                          <Typography>{insights.page_reactions}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Login;