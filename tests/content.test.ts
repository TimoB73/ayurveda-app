import { describe, expect, it } from "vitest";
import { DOSHA_INFO, TYPE_INFO, typeIntro, typeLabel } from "../src/data/content";
import { DOSHAS } from "../src/schema/questions.schema";

describe("Fachtexte", () => {
  it("haben für alle 7 Konstitutionstypen Texte", () => {
    expect(Object.keys(TYPE_INFO).sort()).toEqual(
      ["kapha", "pitta", "pitta-kapha", "tridosha", "vata", "vata-kapha", "vata-pitta"].sort(),
    );
  });

  it("enthalten die vorgegebenen Gunas je Dosha", () => {
    expect(DOSHA_INFO.vata.gunas).toEqual(["trocken", "leicht", "kalt", "rau", "beweglich"]);
    expect(DOSHA_INFO.pitta.gunas).toEqual(["heiß", "scharf", "leicht ölig", "intensiv"]);
    expect(DOSHA_INFO.kapha.gunas).toEqual(["schwer", "kühl", "ölig", "stabil", "weich"]);
  });

  it("vermischen die Doshas nicht mit den Trigunas", () => {
    const text = JSON.stringify({ DOSHA_INFO, TYPE_INFO });
    for (const word of ["Sattva", "Rajas", "Tamas"]) expect(text).not.toContain(word);
  });

  it("benennen Doppeltypen mit dem dominanten Dosha zuerst", () => {
    expect(typeLabel("dual", ["pitta", "vata"])).toBe("Pitta-Vata");
    expect(typeLabel("tri", [...DOSHAS])).toBe("Vata-Pitta-Kapha (Tridosha)");
  });

  it("beschreiben in der Vikriti keine Körpermerkmale der Grundkonstitution", () => {
    expect(typeIntro("vata", "vikriti", ["vata"])).not.toContain("Körperbau");
    expect(typeIntro("vata", "prakriti", ["vata"])).toBe(TYPE_INFO.vata.intro);
  });
});
