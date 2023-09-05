import React, { useState } from "react";
import { supabase } from "../../supabaseClient"; // Import your Supabase client setup

const ZipCodeComponent = ({ userId, onSubmit }) => {
  const [zipCode, setZipCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(zipCode);

    // get user id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // saving zip code to database
    const { data: usersResponse,error } = await supabase
      .from("users")
      .update({ zip_code: zipCode })
      .eq("user_id", user.id).select();

    if (error) {
      console.error("Error updating zip code:", error);
    }

    console.log("user.id", user.id);
    console.log("Sending zip code:", zipCode);
    console.log('users res',usersResponse)

    // get filtered reps
    if(usersResponse) {
      const { data: getFilteredReps, error } = await supabase
      .from('representatives')
      .select()
      .eq("zip_code", zipCode);

      console.log('getFilteredReps', getFilteredReps)
    }


    try {
      const response = await fetch("/.netlify/functions/get-representatives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zipCode: zipCode }),
      });

      const data = await response.json();

      if (data && data.officials && data.offices && data.divisions) {
        await fetch("/.netlify/functions/addRepresentative", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            officials: data.officials, // <-- Note the change to 'officials'
            offices: data.offices,
            divisions: data.divisions,
            user_id: userId,
          }),
        });
      }
    } catch (error) {
      console.error("Error fetching representative info:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Zip Code:
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ZipCodeComponent;
