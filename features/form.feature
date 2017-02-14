Feature: Input form creates a PDF
  As a user of form.asyouareboudoir.com
  I want to be presented with a contact form
  so that I can provide my agreement to the owner efficiently.

  Scenario: Receiving a PDF
    Given I am on the form webpage
    When I enter my data and click "Submit"
    Then I am presented with a PDF version of my form
