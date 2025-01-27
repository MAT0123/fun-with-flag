"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {  useEffect, useReducer } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils";


type Action<T> = {
   type:string,
   payload?: T
}
export default function Home() {
  const initialState = {
    attempt: "",
    countryGuessed: 0,
    wrong: "undecided",
    randomCountry: "",
    randomCountryIndex: 0,
    correctCountry: "",
    isPending: false
  }
  function reducer<T>(states: typeof initialState, action: Action<T>): typeof initialState{
    switch(action.type){
      case "SET_ATTEMPT":
        return {...states, attempt : action.payload as string}
      case "SET_COUNTRY_GUESSED":
        return {...states, countryGuessed: action.payload as number}
      case "SET_WRONG":
        return {...states, wrong: action.payload as string}
      case "SET_RANDOM_COUNTRY":
        return {...states, randomCountry: action.payload as string}
      case "SET_RANDOM_COUNTRY_INDEX":
        return {...states, randomCountryIndex: action.payload as number}
      case "SET_CORRECT_COUNTRY":
        return {...states, correctCountry: action.payload as string}
      case "SET_IS_PENDING":
        return {...states, isPending: action.payload as boolean}
      default:
        return {...states}
  }
}
  const countryCodes: string[] = [
    "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
    "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
    "CO", "KM", "CG", "CD", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC",
    "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA",
    "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT",
    "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP",
    "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
    "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM",
    "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE",
    "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN",
    "PL", "PT", "PR", "QA", "RO", "RU", "RW", "RE", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS",
    "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS",
    "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO",
    "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE",
    "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
  ];
  const [state , dispatch] = useReducer(reducer , initialState);

 // todo , use react form action to submit the form
  async function validate(){
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   
    
  const prompt = ` one is A2_FLAG which is country code (e.g ID , US ) , and USER_GUESED , your task is to validate if USER_GUESED is the similar with the A2_FLAG , typo is acceptable , USER_GUESED written in other language is also fine , abreviation is also fine , lower letter , all capitalize or anything doesnt matter , if no input given , return 0 and country is the correct country , 
   , DO NOT GIVE THE PYTHON CODE DAMN IT , 
  USER_GUESED = ${state.attempt} , A2_FLAG = ${state.randomCountry} , 
  return in format like this , 
   {
   correct : {1 or 0},
   country : {country name}
  } `;
    dispatch({type: "SET_IS_PENDING", payload: true});
    const result = await model.generateContent(prompt);
    dispatch({type: "SET_IS_PENDING", payload: false});
     const jsonData = JSON.parse(result.response.text().slice(7, -4));
    dispatch({type: "SET_COUNTRY_GUESSED", payload: state.countryGuessed + Number(jsonData.correct)});

    if(jsonData.correct == 1){
      dispatch({type: "SET_WRONG", payload: "correct"});  
  }
    else{
      dispatch({type: "SET_WRONG", payload: "wrong"});
    }
    dispatch({type: "SET_CORRECT_COUNTRY", payload: jsonData.country});


  console.log(result.response.text());
}
function deleteCountryByCode(code: string | ""): void {
  const index = countryCodes.findIndex(country => country === code);
  
  if (index !== -1) {
    countryCodes.splice(index, 1);
    console.log(`Country with code ${code} has been deleted.`);
  } else {
    console.log(`Country with code ${code} not found.`);
  }
}
  useEffect(() => {
    dispatch({type: "SET_RANDOM_COUNTRY", payload: countryCodes[Math.floor(Math.random() * countryCodes.length)]});
  }, []);

  function submit(){
    if (state.randomCountry) { 
       validate();
       dispatch({type: "SET_ATTEMPT", payload: ""});
    } 
  }
  return (
    <div className="mx-auto flex flex-col justify-center items-center bg-gray-100 h-screen space-y-14">
      {
        
          <Image
            src={`https://countryflagsapi.netlify.app/flag/${state.randomCountry}.svg`}
            alt={"country flag"}
            width={250}
            height={150}
          />


      }

        <Input placeholder="Country name" className="w-72" onChange={(e) => {
           dispatch({type: "SET_ATTEMPT", payload: e.target.value});
          }} value={state.attempt}/>

        <div className="space-x-4 w-72 flex justify-between">
        <Button className="w-72" disabled={state.wrong == "undecided" || state.isPending == true  ? false : true} onClick={submit} >Submit</Button>
        <Button onClick={() => {  dispatch({type: "SET_WRONG", payload: "undecided"}); dispatch({type: "SET_RANDOM_COUNTRY", payload: countryCodes[Math.floor(Math.random() * countryCodes.length)]});
        }} className={cn(
    "w-72", 
    state.wrong === "correct" ? "bg-green-500" : 
    state.wrong === "wrong" ? "bg-red-500" : 
    "bg-black"
  )} >Next</Button>

        </div>

        <p>Country guessed: {state.countryGuessed} / {countryCodes.length}</p>
{        state.wrong == "wrong" && 
                <Alert className="absolute bottom-2 w-72 right-2">
                <AlertTitle>Incorrect</AlertTitle>
                <AlertDescription>
                {`Incorrect , correct country is ${state.correctCountry}` }
                </AlertDescription>
              </Alert>
}

    </div>
  );
}

