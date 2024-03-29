import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import ZipCodeComponent from "../ZipCodeComponent/ZipCodeComponent";
import RepresentativeCard from "../RepresentativeCard/RepresentativeCard";
import "./Profile.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function Profile({ user }) {
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [repsUpdated, setRepsUpdated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [repsLoading, setRepsLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setFullName(userData.full_name || "");
      setAddressLine1(userData.user_address_line1 || "");
      setAddressLine2(userData.user_address_line2 || "");
      setCity(userData.user_city || "");
      setState(userData.user_state || "");
    }
  }, [userData]);

  useEffect(() => {
    setUserData(user);
    setLoading(false);
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const loadUserZipCode = async () => {
    // get user id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("user", user);

    if (user.id) {
      const { data: getZipCode, error: getZipCodeError } = await supabase
        .from("users")
        .select()
        .eq("user_id", user.id);

      setZipCode(getZipCode[0].zip_code);

      console.log("zipCode", zipCode);

      if (getZipCode.length) {
        console.log("Filtering reps by zip code...", getZipCode[0].zip_code);

        const { data: filteredReps, error: getFilteredRepsError } =
          await supabase
            .from("representatives")
            .select()
            .eq("zip_code", zipCode);

        console.log("filteredReps", filteredReps);
        if (filteredReps.length) setRepsLoading(false);
        setData(filteredReps);

        if (getFilteredRepsError)
          console.log("getFilteredRepsError", getFilteredRepsError);
      } else {
        console.log("Getting all reps...");

        const { data: allReps, error: getFilteredRepsError } = await supabase
          .from("representatives")
          .select("*");

        if (allReps.length) setRepsLoading(false);
        setData(allReps);
        if (getFilteredRepsError)
          console.log("getFilteredRepsError", getFilteredRepsError);
      }
    }
  };

  useEffect(() => {
    // const fetchReps = async () => {
    //   if (userData) {
    //     const response = await fetch("/.netlify/functions/get-reps-from-db");
    //     const data = await response.json();
    //     if (data && data.length) {
    //       setData(data);
    //     } else {
    //       console.error("Error fetching representatives:", data.error);
    //     }
    //   }
    // };
    // fetchReps();
    loadUserZipCode();
  }, [repsUpdated, userData]);

  const handleZipCodeSubmit = async (zipCode) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("zipCode", zipCode);
    console.log("user", user);

    // get filtered reps
    if (user.id) {
      const { data: getFilteredReps, error } = await supabase
        .from("representatives")
        .select()
        .eq("zip_code", zipCode);

      console.log("getFilteredReps", getFilteredReps);
      setZipCode(zipCode);
      
      setData(getFilteredReps);
    }
  };

  const handleUpdate = async () => {
    // ... (the function remains unchanged)
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h2>Profile</h2>
      {userData && (
        <div>
          <p>Email: {userData.email}</p>
          {zipCode && <p>Current Zip Code: {zipCode}</p>}
          <ZipCodeComponent onSubmit={handleZipCodeSubmit} />
          {/* ... rest of the JSX code ... */}
          {data && !repsLoading ? (
            data.map((rep) => (
              <RepresentativeCard
                key={rep.rep_id}
                rep={rep}
                userData={userData}
              />
            ))
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
